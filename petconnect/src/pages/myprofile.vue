<script>
import { getCurrentUser, logout, updatePassword } from '../services/Auth';
import { getProfileById, updateProfile, uploadAvatar } from '../services/Profiles';
import { getPostsByUser, getPostById, subscribeToPosts, applyPostChange, removePostFromList } from '../services/Posts';
import PostCard from '../components/PostCard.vue';

const PASSWORD_COOLDOWN_MS = 5 * 60 * 1000;
const PASSWORD_COOLDOWN_KEY = 'petconnect-password-cooldown';

export default {
    name: 'MyProfile',

    components: { PostCard },

    data() {
        return {
            user: null,
            profile: null,
            username: '',
            bio: '',
            avatar: '',
            avatarFile: null,
            removeAvatar: false,
            newPassword: '',
            posts: [],
            loading: false,
            error: '',
            success: '',
            unsubscribePosts: null,
            passwordCooldownUntil: 0,
            cooldownTimer: null,
            now: Date.now(),
        };
    },

    computed: {
        avatarInitial() {
            return (this.username || 'U').charAt(0).toUpperCase();
        },
        passwordChangeBlocked() {
            return this.passwordCooldownRemaining > 0;
        },
        passwordCooldownRemaining() {
            if (!this.passwordCooldownUntil) {
                return 0;
            }

            return Math.max(0, this.passwordCooldownUntil - this.now);
        },
        passwordCooldownLabel() {
            const totalSeconds = Math.ceil(this.passwordCooldownRemaining / 1000);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;

            if (minutes > 0) {
                return `${minutes} min ${seconds.toString().padStart(2, '0')} s`;
            }

            return `${seconds} s`;
        },
    },

    async mounted() {
        this.user = await getCurrentUser();

        if (!this.user) {
            this.$router.push('/login');
            return;
        }

        this.loadPasswordCooldown();
        this.cooldownTimer = setInterval(() => {
            this.now = Date.now();

            if (!this.passwordChangeBlocked && this.passwordCooldownUntil) {
                this.clearPasswordCooldown();
            }
        }, 1000);

        await this.loadProfile();
        await this.loadPosts();

        this.unsubscribePosts = subscribeToPosts((payload) => {
            this.handlePostChange(payload);
        }, this.user.id);
    },

    unmounted() {
        if (this.cooldownTimer) {
            clearInterval(this.cooldownTimer);
        }

        if (this.unsubscribePosts) {
            this.unsubscribePosts();
        }
    },

    methods: {
        getPasswordCooldownStorageKey() {
            return `${PASSWORD_COOLDOWN_KEY}-${this.user.id}`;
        },

        loadPasswordCooldown() {
            const storedUntil = localStorage.getItem(this.getPasswordCooldownStorageKey());

            if (!storedUntil) {
                this.passwordCooldownUntil = 0;
                return;
            }

            const until = Number(storedUntil);

            if (until > Date.now()) {
                this.passwordCooldownUntil = until;
            } else {
                this.clearPasswordCooldown();
            }
        },

        startPasswordCooldown() {
            this.passwordCooldownUntil = Date.now() + PASSWORD_COOLDOWN_MS;
            localStorage.setItem(
                this.getPasswordCooldownStorageKey(),
                String(this.passwordCooldownUntil)
            );
            this.now = Date.now();
        },

        clearPasswordCooldown() {
            this.passwordCooldownUntil = 0;
            localStorage.removeItem(this.getPasswordCooldownStorageKey());
        },

        async loadProfile() {
            try {
                this.profile = await getProfileById(this.user.id);
                this.username = this.profile?.username
                    || this.user.user_metadata?.username
                    || '';
                this.bio = this.profile?.bio || '';
                this.avatar = this.profile?.avatar || '';
            } catch (error) {
                this.error = error.message;
            }
        },

        async loadPosts() {
            try {
                this.posts = await getPostsByUser(this.user.id);
            } catch (error) {
                this.error = error.message;
            }
        },

        async handlePostChange(payload) {
            try {
                this.posts = await applyPostChange(this.posts, payload, getPostById);
            } catch (error) {
                this.error = error.message;
            }
        },

        handlePostDeleted(postId) {
            this.posts = removePostFromList(this.posts, postId);
        },

        handleAvatar(event) {
            this.avatarFile = event.target.files[0];
            this.removeAvatar = false;
        },

        handleRemoveAvatar() {
            this.avatar = '';
            this.avatarFile = null;
            this.removeAvatar = true;
        },

        async handleSubmit() {
            this.loading = true;
            this.error = '';
            this.success = '';

            if (this.newPassword && this.passwordChangeBlocked) {
                this.error = `Podés cambiar la contraseña de nuevo en ${this.passwordCooldownLabel}.`;
                this.loading = false;
                return;
            }

            try {
                let avatarUrl = this.avatar;
                let passwordChanged = false;

                if (this.removeAvatar) {
                    avatarUrl = null;
                } else if (this.avatarFile) {
                    avatarUrl = await uploadAvatar(this.avatarFile, this.user.id);
                }

                this.profile = await updateProfile(this.user.id, {
                    username: this.username,
                    bio: this.bio,
                    avatar: avatarUrl,
                });

                if (this.newPassword) {
                    await updatePassword(this.newPassword);
                    this.newPassword = '';
                    passwordChanged = true;
                    this.startPasswordCooldown();
                }

                this.avatar = avatarUrl || '';
                this.avatarFile = null;
                this.removeAvatar = false;
                this.success = passwordChanged
                    ? 'Guardado. También cambiamos la contraseña.'
                    : 'Cambios guardados.';
            } catch (error) {
                this.error = error.message;
            }

            this.loading = false;
        },

        async handleLogout() {
            await logout();
            this.$router.push('/login');
        },
    },
};
</script>

<template>
    <main class="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <section class="pet-card overflow-hidden">
            <div class="h-28 bg-pet-400 sm:h-36"></div>

            <div class="relative px-6 pb-6">
                <div class="-mt-14 mb-5 flex flex-col items-center gap-4 sm:-mt-16 sm:flex-row sm:items-end">
                    <img
                        v-if="avatar"
                        :src="avatar"
                        alt="Foto de perfil"
                        class="avatar-ring h-28 w-28 rounded-full object-cover sm:h-32 sm:w-32"
                    >

                    <div
                        v-else
                        class="avatar-ring avatar-placeholder h-28 w-28 rounded-full text-3xl sm:h-32 sm:w-32"
                        aria-hidden="true"
                    >
                        {{ avatarInitial }}
                    </div>

                    <div class="text-center sm:pb-2 sm:text-left">
                        <h1 class="text-3xl font-bold text-pet-800">
                            {{ username || 'Mi perfil' }}
                        </h1>
                    </div>
                </div>

                <p v-if="error" role="alert" class="mb-4 rounded-lg bg-red-50 px-4 py-3 text-red-700">
                    {{ error }}
                </p>

                <p v-if="success" role="status" class="mb-4 rounded-lg bg-green-50 px-4 py-3 text-green-700">
                    {{ success }}
                </p>

                <form class="space-y-5" @submit.prevent="handleSubmit" novalidate>
                    <div>
                        <label for="profile-username" class="mb-2 block font-bold text-pet-800">Nombre de usuario</label>
                        <input id="profile-username" v-model="username" type="text" name="username" required class="pet-input">
                    </div>

                    <div>
                        <label for="profile-bio" class="mb-2 block font-bold text-pet-800">Biografía</label>
                        <textarea
                            id="profile-bio"
                            v-model="bio"
                            name="bio"
                            rows="4"
                            class="pet-input resize-none"
                            placeholder="Algo sobre vos o tu mascota"
                        ></textarea>
                    </div>

                    <div>
                        <p id="profile-avatar-label" class="mb-2 block font-bold text-pet-800">Foto de perfil</p>
                        <label class="pet-file block">
                            <span class="pet-file-row">
                                <span class="pet-file-button">Elegir archivo</span>
                                <span class="pet-file-name">
                                    {{ avatarFile ? avatarFile.name : 'Ningún archivo seleccionado' }}
                                </span>
                            </span>
                            <input
                                id="profile-avatar"
                                type="file"
                                name="avatar"
                                accept="image/*"
                                class="pet-file-input"
                                aria-labelledby="profile-avatar-label"
                                @change="handleAvatar"
                            >
                        </label>

                        <button
                            v-if="avatar || avatarFile"
                            type="button"
                            class="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                            @click="handleRemoveAvatar"
                        >
                            Eliminar foto
                        </button>
                    </div>

                    <div>
                        <label for="profile-password" class="mb-2 block font-bold text-pet-800">Nueva contraseña</label>
                        <input
                            id="profile-password"
                            v-model="newPassword"
                            type="password"
                            name="new-password"
                            autocomplete="new-password"
                            class="pet-input disabled:cursor-not-allowed disabled:bg-stone-100"
                            :disabled="passwordChangeBlocked"
                            placeholder="Dejalo vacío si no la cambiás"
                        >
                        <p
                            v-if="passwordChangeBlocked"
                            class="mt-2 rounded-lg bg-pet-50 px-3 py-2 text-sm text-pet-800"
                        >
                            Podés cambiarla de nuevo en {{ passwordCooldownLabel }}.
                        </p>
                    </div>

                    <div class="flex flex-wrap gap-3">
                        <button type="submit" class="pet-btn-primary">
                            {{ loading ? 'Guardando...' : 'Guardar cambios' }}
                        </button>
                        <button
                            type="button"
                            class="rounded-lg bg-stone-800 px-5 py-3 font-bold text-white transition hover:bg-stone-900"
                            @click="handleLogout"
                        >
                            Cerrar sesión
                        </button>
                    </div>
                </form>
            </div>
        </section>

        <section class="mt-8">
            <h2 class="section-title mb-5">
                Mis publicaciones
            </h2>

            <div v-if="posts.length" class="space-y-6">
                <PostCard
                    v-for="post in posts"
                    :key="post.id"
                    :post="post"
                    :user="user"
                    @deleted="handlePostDeleted"
                />
            </div>

            <div v-else class="empty-state">
                <h3 class="font-display text-xl font-bold text-pet-800">
                    Todavía no publicaste nada
                </h3>
                <p class="mt-2">Andá a publicaciones y subí algo.</p>
                <RouterLink to="/feed" class="pet-btn-primary mt-5 inline-flex">
                    Ver publicaciones
                </RouterLink>
            </div>
        </section>
    </main>
</template>

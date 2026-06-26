<script>
import { getCurrentUser, logout, updatePassword } from '../services/auth';
import { getProfileById, updateProfile, uploadAvatar } from '../services/profiles';
import { getPostsByUser } from '../services/posts';
import PostCard from '../components/postcard.vue';

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
            newPassword: '',
            posts: [],
            loading: false,
            error: '',
            success: '',
        };
    },

    async mounted() {
        this.user = await getCurrentUser();

        if (!this.user) {
            this.$router.push('/login');
            return;
        }

        await this.loadProfile();
        await this.loadPosts();
    },

    methods: {
        async loadProfile() {
            try {
                this.profile = await getProfileById(this.user.id);
                this.username = this.profile.username || '';
                this.bio = this.profile.bio || '';
                this.avatar = this.profile.avatar || '';
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

        handleAvatar(event) {
            this.avatarFile = event.target.files[0];
        },

        async handleSubmit() {
            this.loading = true;
            this.error = '';
            this.success = '';

            try {
                let avatarUrl = this.avatar;

                if (this.avatarFile) {
                    avatarUrl = await uploadAvatar(this.avatarFile, this.user.id);
                }

                await updateProfile(this.user.id, {
                    username: this.username,
                    bio: this.bio,
                    avatar: avatarUrl,
                });

                if (this.newPassword) {
                    await updatePassword(this.newPassword);
                    this.newPassword = '';
                }

                await this.loadProfile();
                await this.loadPosts();

                this.avatarFile = null;
                this.success = 'Perfil actualizado correctamente.';
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
    <main class="mx-auto max-w-3xl p-6">
        <section class="mb-6 rounded-xl border bg-white p-6 shadow-sm">
            <div class="mb-6 flex items-center gap-4">
                <img
                    v-if="avatar"
                    :src="avatar"
                    alt="Foto de perfil"
                    class="h-24 w-24 rounded-full object-cover"
                >

                <div
                    v-else
                    class="flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 text-5xl"
                >
                    🐾
                </div>

                <div>
                    <h1 class="text-3xl font-bold text-gray-900">
                        Mi perfil
                    </h1>

                    <p class="text-gray-500">
                        Editá tus datos, foto de perfil y contraseña.
                    </p>
                </div>
            </div>

            <p v-if="error" class="mb-3 rounded bg-red-100 p-3 text-red-700">
                {{ error }}
            </p>

            <p v-if="success" class="mb-3 rounded bg-green-100 p-3 text-green-700">
                {{ success }}
            </p>

            <form v-if="profile" @submit.prevent="handleSubmit" class="space-y-4">
                <div>
                    <label class="mb-1 block font-semibold">
                        Nombre de usuario
                    </label>

                    <input
                        v-model="username"
                        type="text"
                        class="w-full rounded-lg border p-3 focus:border-orange-500 focus:outline-none"
                    >
                </div>

                <div>
                    <label class="mb-1 block font-semibold">
                        Biografía
                    </label>

                    <textarea
                        v-model="bio"
                        rows="4"
                        class="w-full rounded-lg border p-3 focus:border-orange-500 focus:outline-none"
                        placeholder="Contá algo sobre vos y tu mascota..."
                    ></textarea>
                </div>

                <div>
                    <label class="mb-2 block font-semibold">
                        Foto de perfil
                    </label>

                    <label class="block cursor-pointer rounded-lg border-2 border-dashed border-orange-400 bg-orange-50 p-5 text-center hover:bg-orange-100">
                        <p class="font-semibold text-orange-600">
                            📷 Hacé clic para elegir una foto
                        </p>

                        <p class="text-sm text-gray-500">
                            JPG, PNG o WEBP
                        </p>

                        <p v-if="avatarFile" class="mt-2 text-green-600">
                            ✅ {{ avatarFile.name }}
                        </p>

                        <input
                            type="file"
                            accept="image/*"
                            class="hidden"
                            @change="handleAvatar"
                        >
                    </label>
                </div>

                <div>
                    <label class="mb-1 block font-semibold">
                        Nueva contraseña
                    </label>

                    <input
                        v-model="newPassword"
                        type="password"
                        class="w-full rounded-lg border p-3 focus:border-orange-500 focus:outline-none"
                        placeholder="Dejar vacío si no querés cambiarla"
                    >
                </div>

                <div class="flex gap-3">
                    <button
                        type="submit"
                        class="rounded-lg bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
                    >
                        {{ loading ? 'Guardando...' : 'Guardar cambios' }}
                    </button>

                    <button
                        type="button"
                        class="rounded-lg bg-gray-800 px-5 py-3 font-semibold text-white hover:bg-gray-900"
                        @click="handleLogout"
                    >
                        Cerrar sesión
                    </button>
                </div>
            </form>
        </section>

        <section>
            <h2 class="mb-4 text-2xl font-bold">
                Mis publicaciones
            </h2>

            <div v-if="posts.length" class="space-y-5">
                <PostCard
                    v-for="post in posts"
                    :key="post.id"
                    :post="post"
                    :user="user"
                />
            </div>

            <p v-else class="rounded-xl border bg-white p-6 text-center text-gray-500">
                Todavía no hiciste publicaciones.
            </p>
        </section>
    </main>
</template>
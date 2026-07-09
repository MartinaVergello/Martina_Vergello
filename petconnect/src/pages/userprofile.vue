<script>
import { getProfileById } from '../services/Profiles';
import { getPostsByUser } from '../services/Posts';
import PostCard from '../components/PostCard.vue';

export default {
    name: 'UserProfile',
    components: { PostCard },
    data() {
        return {
            profile: null,
            posts: [],
            error: '',
        };
    },
    computed: {
        avatarInitial() {
            return (this.profile?.username || 'U').charAt(0).toUpperCase();
        },
    },
    async mounted() {
        await this.loadProfile();
        await this.loadPosts();
    },
    methods: {
        async loadProfile() {
            try {
                this.profile = await getProfileById(this.$route.params.id);
            } catch (error) {
                this.error = error.message;
            }
        },
        async loadPosts() {
            try {
                this.posts = await getPostsByUser(this.$route.params.id);
            } catch (error) {
                this.error = error.message;
            }
        },
    },
};
</script>

<template>
    <main class="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <p v-if="error" role="alert" class="mb-4 rounded-lg bg-red-50 px-4 py-3 text-red-700">
            {{ error }}
        </p>

        <section v-if="profile" class="pet-card overflow-hidden">
            <div class="h-28 bg-pet-300 sm:h-36"></div>

            <div class="relative px-6 pb-6">
                <div class="-mt-12 flex flex-col items-center gap-4 sm:-mt-14 sm:flex-row sm:items-end">
                    <img
                        v-if="profile.avatar"
                        :src="profile.avatar"
                        :alt="'Foto de perfil de ' + profile.username"
                        class="avatar-ring h-24 w-24 rounded-full object-cover sm:h-28 sm:w-28"
                    >

                    <div
                        v-else
                        class="avatar-ring avatar-placeholder h-24 w-24 rounded-full text-2xl sm:h-28 sm:w-28"
                        aria-hidden="true"
                    >
                        {{ avatarInitial }}
                    </div>

                    <div class="text-center sm:pb-2 sm:text-left">
                        <h1 class="text-3xl font-bold text-pet-800">
                            {{ profile.username }}
                        </h1>
                    </div>
                </div>

                <p class="mt-5 rounded-xl bg-pet-50 px-4 py-4 text-stone-700">
                    {{ profile.bio || 'Sin biografía todavía.' }}
                </p>
            </div>
        </section>

        <div v-else-if="!error" class="empty-state">
            <h1 class="font-display text-xl font-bold text-pet-800">
                No encontramos ese usuario
            </h1>
        </div>

        <section class="mt-8">
            <h2 class="section-title mb-5">
                Publicaciones
            </h2>

            <div v-if="posts.length" class="space-y-6">
                <PostCard
                    v-for="post in posts"
                    :key="post.id"
                    :post="post"
                    :user="null"
                />
            </div>

            <div v-else class="empty-state">
                <h3 class="font-display text-xl font-bold text-pet-800">
                    Sin publicaciones
                </h3>
                <p class="mt-2">Capaz todavía no subió nada en publicaciones.</p>
            </div>
        </section>
    </main>
</template>

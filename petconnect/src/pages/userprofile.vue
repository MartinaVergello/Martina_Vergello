<script>
import { getProfileById } from '../services/profiles';
import { getPostsByUser } from '../services/posts';

export default {
    name: 'UserProfile',
    data() {
        return {
            profile: null,
            posts: [],
            error: '',
        };
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
    <main class="mx-auto max-w-2xl p-6">
        <p v-if="error" class="mb-3 text-red-600">{{ error }}</p>

        <section v-if="profile" class="mb-6 rounded bg-orange-50 p-4">
            <h1 class="text-2xl font-bold text-orange-600">
                {{ profile.username }}
            </h1>

            <p class="mt-2 text-gray-700">
                {{ profile.bio || 'Este usuario todavía no agregó una biografía.' }}
            </p>
        </section>

        <h2 class="mb-3 text-xl font-bold">Publicaciones</h2>

        <section class="space-y-4">
            <article
                v-for="post in posts"
                :key="post.id"
                class="rounded border bg-white p-4"
            >
                <p>{{ post.content }}</p>

                <p class="mt-3 text-sm text-gray-500">
                    {{ new Date(post.created_at).toLocaleString() }}
                </p>
            </article>
        </section>
    </main>
</template>
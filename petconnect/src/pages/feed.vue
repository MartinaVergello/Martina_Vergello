<script>
import { getCurrentUser } from '../services/auth';
import { getPosts, createPost, subscribeToPosts } from '../services/posts';
import { uploadPostImage } from '../services/storage';
import PostCard from '../components/postcard.vue';

export default {
    name: 'Feed',
    components: { PostCard },

    data() {
        return {
            user: null,
            posts: [],
            content: '',
            image: null,
            loading: false,
            error: '',
            unsubscribePosts: null,
        };
    },

    async mounted() {
        this.user = await getCurrentUser();
        await this.loadPosts();

        this.unsubscribePosts = subscribeToPosts(async () => {
            await this.loadPosts();
        });
    },

    unmounted() {
        if (this.unsubscribePosts) {
            this.unsubscribePosts();
        }
    },

    methods: {
        async loadPosts() {
            try {
                this.posts = await getPosts();
            } catch (error) {
                this.error = error.message;
            }
        },

        handleImage(event) {
            this.image = event.target.files[0];
        },

        async handleSubmit() {
            if (!this.user) {
                this.error = 'Tenés que iniciar sesión para publicar.';
                return;
            }

            if (!this.content) {
                this.error = 'Escribí algo para publicar.';
                return;
            }

            this.loading = true;
            this.error = '';

            try {
                let imageUrl = null;

                if (this.image) {
                    imageUrl = await uploadPostImage(this.image);
                }

                await createPost(this.user.id, this.content, imageUrl);

                this.content = '';
                this.image = null;
                this.$refs.imageInput.value = '';

                await this.loadPosts();
            } catch (error) {
                this.error = error.message;
            }

            this.loading = false;
        },
    },
};
</script>

<template>
    <main class="mx-auto max-w-2xl p-6">

        <h1 class="mb-6 text-3xl font-bold">
            Feed de mascotas
        </h1>

        <form
            @submit.prevent="handleSubmit"
            class="mb-6 rounded-lg border bg-white p-5 shadow"
        >

            <label class="mb-3 block text-lg font-bold">
                Nueva publicación
            </label>

            <textarea
                v-model="content"
                rows="4"
                placeholder="¿Qué hizo tu mascota hoy?"
                class="mb-4 w-full rounded-lg border p-3 focus:border-orange-500 focus:outline-none"
            ></textarea>

            <!-- Subir imagen -->

            <label
                class="mb-4 flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-orange-400 bg-orange-50 p-8 text-center transition hover:border-orange-500 hover:bg-orange-100"
            >

                <div>

                    <p class="text-5xl">
                        📷
                    </p>

                    <p class="mt-3 text-lg font-semibold text-orange-600">
                        Hacé clic para seleccionar una imagen
                    </p>

                    <p class="text-sm text-gray-500">
                        JPG · PNG · WEBP
                    </p>

                    <p
                        v-if="image"
                        class="mt-4 font-semibold text-green-600"
                    >
                        ✅ {{ image.name }}
                    </p>

                </div>

                <input
                    ref="imageInput"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleImage"
                >

            </label>

            <p
                v-if="error"
                class="mb-4 text-red-600"
            >
                {{ error }}
            </p>

            <button
                class="rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
            >
                {{ loading ? 'Publicando...' : 'Publicar' }}
            </button>

        </form>

        <section class="space-y-5">

            <PostCard
                v-for="post in posts"
                :key="post.id"
                :post="post"
                :user="user"
            />

        </section>

    </main>
</template>
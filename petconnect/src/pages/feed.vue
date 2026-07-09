<script>
import { getCurrentUser } from '../services/Auth';
import { getPosts, createPost, getPostById, subscribeToPosts, applyPostChange } from '../services/Posts';
import { uploadPostImage } from '../services/Storage';
import PostCard from '../components/PostCard.vue';

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

        this.unsubscribePosts = subscribeToPosts((payload) => {
            this.handlePostChange(payload);
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

        async handlePostChange(payload) {
            try {
                this.posts = await applyPostChange(this.posts, payload, getPostById);
            } catch (error) {
                this.error = error.message;
            }
        },

        handlePostDeleted(postId) {
            this.posts = this.posts.filter(post => post.id !== postId);
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

                const newPost = await createPost(this.user.id, this.content, imageUrl);

                if (!this.posts.some(post => post.id === newPost.id)) {
                    this.posts.unshift(newPost);
                }

                this.content = '';
                this.image = null;
                this.$refs.imageInput.value = '';
            } catch (error) {
                this.error = error.message;
            }

            this.loading = false;
        },
    },
};
</script>

<template>
    <main class="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 class="section-title mb-8">
            Publicaciones
        </h1>

        <form
            v-if="user"
            class="pet-card mb-8 p-6"
            aria-labelledby="feed-form-title"
            @submit.prevent="handleSubmit"
            novalidate
        >
            <h2 id="feed-form-title" class="mb-4 text-xl font-bold text-pet-800">
                Nueva publicación
            </h2>

            <label for="feed-content" class="mb-2 block font-bold text-pet-800">
                Contenido
            </label>
            <textarea
                id="feed-content"
                v-model="content"
                name="content"
                rows="4"
                placeholder="¿Qué hizo tu mascota hoy?"
                class="pet-input mb-4 resize-none"
                required
            ></textarea>

            <div class="mb-4">
                <p id="feed-image-label" class="mb-2 block font-bold text-pet-800">
                    Foto (opcional)
                </p>
                <label class="pet-file block">
                    <span class="pet-file-row">
                        <span class="pet-file-button">Elegir archivo</span>
                        <span class="pet-file-name">
                            {{ image ? image.name : 'Ningún archivo seleccionado' }}
                        </span>
                    </span>
                    <input
                        id="feed-image"
                        ref="imageInput"
                        type="file"
                        name="image"
                        accept="image/*"
                        class="pet-file-input"
                        aria-labelledby="feed-image-label"
                        @change="handleImage"
                    >
                </label>
            </div>

            <p v-if="error" role="alert" class="mb-4 rounded-lg bg-red-50 px-4 py-3 text-red-700">
                {{ error }}
            </p>

            <button type="submit" class="pet-btn-primary">
                {{ loading ? 'Publicando...' : 'Publicar' }}
            </button>
        </form>

        <div v-else class="pet-card mb-8 p-6 text-center">
            <p class="font-bold text-pet-800">Tenés que entrar para publicar</p>
            <div class="mt-4 flex flex-wrap justify-center gap-3">
                <RouterLink to="/login" class="pet-btn-primary">Entrar</RouterLink>
                <RouterLink to="/registro" class="pet-btn-secondary">Registrarse</RouterLink>
            </div>
        </div>

        <section aria-labelledby="feed-posts-title" class="space-y-6">
            <h2 id="feed-posts-title" class="sr-only">
                Publicaciones
            </h2>
            <PostCard
                v-for="post in posts"
                :key="post.id"
                :post="post"
                :user="user"
                @deleted="handlePostDeleted"
            />

            <div v-if="!posts.length" class="empty-state">
                <h3 class="font-display text-xl font-bold text-pet-800">
                    Todavía no hay nada acá
                </h3>
                <p class="mt-2">
                    Publicá la primera si ya entraste.
                </p>
            </div>
        </section>
    </main>
</template>

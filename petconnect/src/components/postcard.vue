<script>
import { getComments, createComment, subscribeToComments } from '../services/comments';
import { updatePost, deletePost } from '../services/posts';
import { getLikesByPost, likePost, unlikePost, subscribeToLikes } from '../services/likes';

export default {
    name: 'PostCard',
    props: {
        post: {
            type: Object,
            required: true,
        },
        user: {
            type: Object,
            default: null,
        },
    },
    data() {
        return {
            comments: [],
            likes: [],
            newComment: '',
            editing: false,
            editedContent: this.post.content,
            error: '',
            unsubscribeComments: null,
            unsubscribeLikes: null,
        };
    },
    computed: {
        isOwner() {
            return this.user && this.user.id === this.post.user_id;
        },
        userLiked() {
            return this.user && this.likes.some(like => like.user_id === this.user.id);
        },
    },
    async mounted() {
        await this.loadComments();
        await this.loadLikes();

        this.unsubscribeComments = subscribeToComments(this.post.id, async () => {
            await this.loadComments();
        });

        this.unsubscribeLikes = subscribeToLikes(this.post.id, async () => {
            await this.loadLikes();
        });
    },
    unmounted() {
        if (this.unsubscribeComments) {
            this.unsubscribeComments();
        }

        if (this.unsubscribeLikes) {
            this.unsubscribeLikes();
        }
    },
    methods: {
        async loadComments() {
            try {
                this.comments = await getComments(this.post.id);
            } catch (error) {
                this.error = error.message;
            }
        },
        async loadLikes() {
            try {
                this.likes = await getLikesByPost(this.post.id);
            } catch (error) {
                this.error = error.message;
            }
        },
        async handleLike() {
            if (!this.user) {
                this.error = 'Tenés que iniciar sesión para dar like.';
                return;
            }

            try {
                if (this.userLiked) {
                    await unlikePost(this.post.id, this.user.id);
                } else {
                    await likePost(this.post.id, this.user.id);
                }

                await this.loadLikes();
            } catch (error) {
                this.error = error.message;
            }
        },
        async handleComment() {
            if (!this.user) {
                this.error = 'Tenés que iniciar sesión para comentar.';
                return;
            }

            if (!this.newComment) return;

            try {
                await createComment(this.post.id, this.user.id, this.newComment);
                this.newComment = '';
                await this.loadComments();
            } catch (error) {
                this.error = error.message;
            }
        },
        async handleUpdate() {
            if (!this.editedContent) return;

            try {
                await updatePost(this.post.id, this.editedContent);
                this.post.content = this.editedContent;
                this.editing = false;
            } catch (error) {
                this.error = error.message;
            }
        },
        async handleDelete() {
            const confirmDelete = confirm('¿Seguro que querés eliminar esta publicación?');

            if (!confirmDelete) return;

            try {
                await deletePost(this.post.id);
                window.location.reload();
            } catch (error) {
                this.error = error.message;
            }
        },
    },
};
</script>

<template>
    <article class="overflow-hidden rounded-xl border bg-white shadow-sm">
        <header class="flex items-center justify-between border-b p-4">
            <div class="flex items-center gap-3">
                <div class="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-xl">
                    🐾
                </div>

                <div>
                    <RouterLink
                        :to="'/usuario/' + post.user_id"
                        class="font-bold text-orange-600 hover:underline"
                    >
                        {{ post.profiles?.username || 'Usuario' }}
                    </RouterLink>

                    <p class="text-xs text-gray-500">
                        {{ new Date(post.created_at).toLocaleString() }}
                    </p>
                </div>
            </div>

            <div v-if="isOwner" class="flex gap-2 text-sm">
                <button
                    v-if="!editing"
                    class="rounded bg-blue-100 px-3 py-1 text-blue-700 hover:bg-blue-200"
                    @click="editing = true"
                >
                    ✏️ Editar
                </button>

                <button
                    class="rounded bg-red-100 px-3 py-1 text-red-700 hover:bg-red-200"
                    @click="handleDelete"
                >
                    🗑 Eliminar
                </button>
            </div>
        </header>

        <section class="p-4">
            <div v-if="editing">
                <textarea
                    v-model="editedContent"
                    class="mb-3 w-full rounded-lg border p-3 focus:border-orange-500 focus:outline-none"
                    rows="3"
                ></textarea>

                <div class="flex gap-2">
                    <button
                        class="rounded bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
                        @click="handleUpdate"
                    >
                        Guardar
                    </button>

                    <button
                        class="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
                        @click="editing = false"
                    >
                        Cancelar
                    </button>
                </div>
            </div>

            <p v-else class="text-gray-800">
                {{ post.content }}
            </p>

            <img
                v-if="post.image"
                :src="post.image"
                alt="Imagen de la publicación"
                class="mt-4 max-h-96 w-full rounded-xl object-cover"
            >

            <div class="mt-4 flex items-center gap-4 border-t pt-4">
                <button
                    class="rounded-full px-4 py-2 font-semibold transition"
                    :class="userLiked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                    @click="handleLike"
                >
                    {{ userLiked ? '❤️ Te gusta' : '🤍 Me gusta' }}
                </button>

                <p class="text-sm text-gray-500">
                    {{ likes.length }} me gusta
                </p>
            </div>
        </section>

        <section class="border-t bg-gray-50 p-4">
            <h3 class="mb-3 font-bold">
                Comentarios
                <span class="text-sm font-normal text-gray-500">
                    ({{ comments.length }})
                </span>
            </h3>

            <p v-if="error" class="mb-3 text-sm text-red-600">
                {{ error }}
            </p>

            <ul v-if="comments.length" class="mb-4 space-y-2">
                <li
                    v-for="comment in comments"
                    :key="comment.id"
                    class="rounded-lg bg-white p-3 text-sm shadow-sm"
                >
                    <strong class="text-orange-600">
                        {{ comment.profiles?.username || 'Usuario' }}:
                    </strong>
                    {{ comment.content }}
                </li>
            </ul>

            <p v-else class="mb-4 text-sm text-gray-500">
                Todavía no hay comentarios.
            </p>

            <form @submit.prevent="handleComment" class="flex gap-2">
                <input
                    v-model="newComment"
                    class="flex-1 rounded-lg border p-2 focus:border-orange-500 focus:outline-none"
                    type="text"
                    placeholder="Escribir comentario..."
                >

                <button class="rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600">
                    Comentar
                </button>
            </form>
        </section>
    </article>
</template>
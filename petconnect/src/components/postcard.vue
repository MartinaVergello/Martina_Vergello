<script>
import { getComments, createComment, getCommentById, subscribeToComments } from '../services/Comments';
import { updatePost, deletePost } from '../services/Posts';
import { getLikesByPost, likePost, unlikePost, subscribeToLikes } from '../services/Likes';

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
    emits: ['deleted'],
    data() {
        return {
            comments: [],
            likes: [],
            newComment: '',
            editing: false,
            editedContent: this.post.content,
            error: '',
            imageOrientation: null,
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
        authorInitial() {
            const name = this.post.profiles?.username || 'U';
            return name.charAt(0).toUpperCase();
        },
    },
    watch: {
        'post.image'() {
            this.imageOrientation = null;

            this.$nextTick(() => {
                this.checkImageOrientation();
            });
        },
    },
    async mounted() {
        await this.loadComments();
        await this.loadLikes();

        this.unsubscribeComments = subscribeToComments(this.post.id, (payload) => {
            this.handleCommentChange(payload);
        });

        this.unsubscribeLikes = subscribeToLikes(this.post.id, (payload) => {
            this.handleLikeChange(payload);
        });

        this.$nextTick(() => {
            this.checkImageOrientation();
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
        async handleCommentChange(payload) {
            const { eventType, new: newRecord, old: oldRecord } = payload;

            if (eventType === 'INSERT') {
                if (this.comments.some(comment => comment.id === newRecord.id)) {
                    return;
                }

                try {
                    const comment = await getCommentById(newRecord.id);
                    this.comments.push(comment);
                } catch (error) {
                    this.error = error.message;
                }

                return;
            }

            if (eventType === 'UPDATE') {
                const index = this.comments.findIndex(comment => comment.id === newRecord.id);

                if (index !== -1) {
                    this.comments[index] = {
                        ...this.comments[index],
                        ...newRecord,
                    };
                }

                return;
            }

            if (eventType === 'DELETE') {
                this.comments = this.comments.filter(comment => comment.id !== oldRecord.id);
            }
        },
        handleLikeChange(payload) {
            const { eventType, new: newRecord, old: oldRecord } = payload;

            if (eventType === 'INSERT') {
                if (!this.likes.some(like => like.id === newRecord.id)) {
                    this.likes.push(newRecord);
                }

                return;
            }

            if (eventType === 'DELETE') {
                this.likes = this.likes.filter(like => {
                    if (oldRecord.id) {
                        return like.id !== oldRecord.id;
                    }

                    return !(
                        like.post_id === oldRecord.post_id
                        && like.user_id === oldRecord.user_id
                    );
                });
            }
        },
        async handleLike() {
            if (!this.user) {
                this.error = 'Tenés que iniciar sesión para dar me gusta.';
                return;
            }

            const previousLikes = [...this.likes];

            try {
                if (this.userLiked) {
                    this.likes = this.likes.filter(like => like.user_id !== this.user.id);
                    await unlikePost(this.post.id, this.user.id);
                } else {
                    const like = await likePost(this.post.id, this.user.id);

                    if (!this.likes.some(item => item.id === like.id)) {
                        this.likes.push(like);
                    }
                }
            } catch (error) {
                this.likes = previousLikes;
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
                const comment = await createComment(this.post.id, this.user.id, this.newComment);

                if (!this.comments.some(item => item.id === comment.id)) {
                    this.comments.push(comment);
                }

                this.newComment = '';
            } catch (error) {
                this.error = error.message;
            }
        },
        async handleUpdate() {
            if (!this.editedContent) return;

            try {
                const updatedPost = await updatePost(this.post.id, this.editedContent);
                this.post.content = updatedPost.content;
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
                this.$emit('deleted', this.post.id);
            } catch (error) {
                this.error = error.message;
            }
        },

        handleImageLoad(event) {
            this.setImageOrientation(event.target);
        },

        checkImageOrientation() {
            const img = this.$refs.postImage;

            if (img?.complete) {
                this.setImageOrientation(img);
            }
        },

        setImageOrientation(img) {
            if (!img?.naturalWidth || !img?.naturalHeight) {
                return;
            }

            this.imageOrientation = img.naturalHeight >= img.naturalWidth ? 'portrait' : 'landscape';
        },
    },
};
</script>

<template>
    <article class="pet-card overflow-hidden">
        <header class="flex items-center justify-between border-b border-pet-100 bg-pet-50 px-5 py-4">
            <div class="flex items-center gap-3">
                <img
                    v-if="post.profiles?.avatar"
                    :src="post.profiles.avatar"
                    :alt="'Foto de perfil de ' + (post.profiles?.username || 'usuario')"
                    class="h-11 w-11 rounded-full object-cover ring-2 ring-pet-200"
                >

                <div
                    v-else
                    class="avatar-placeholder h-11 w-11 rounded-full text-sm"
                    aria-hidden="true"
                >
                    {{ authorInitial }}
                </div>

                <div>
                    <h2 class="text-base font-bold leading-tight">
                        <RouterLink
                            :to="'/usuario/' + post.user_id"
                            class="text-pet-700 transition hover:text-pet-500"
                        >
                            {{ post.profiles?.username || 'Usuario' }}
                        </RouterLink>
                    </h2>

                    <p class="text-xs text-stone-500">
                        {{ new Date(post.created_at).toLocaleString('es-AR') }}
                    </p>
                </div>
            </div>

            <div v-if="isOwner" class="flex gap-2">
                <button
                    v-if="!editing"
                    type="button"
                    class="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-pet-700 ring-1 ring-pet-200 transition hover:bg-pet-50"
                    @click="editing = true"
                >
                    Editar
                </button>

                <button
                    type="button"
                    class="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-red-600 ring-1 ring-red-200 transition hover:bg-red-50"
                    @click="handleDelete"
                >
                    Eliminar
                </button>
            </div>
        </header>

        <section class="p-5">
            <div v-if="editing">
                <label :for="'edit-post-' + post.id" class="mb-2 block font-bold text-pet-800">
                    Editar publicación
                </label>
                <textarea
                    :id="'edit-post-' + post.id"
                    v-model="editedContent"
                    class="pet-input mb-3 resize-none"
                    rows="3"
                ></textarea>

                <div class="flex gap-2">
                    <button type="button" class="pet-btn-primary" @click="handleUpdate">
                        Guardar
                    </button>
                    <button type="button" class="pet-btn-secondary" @click="editing = false">
                        Cancelar
                    </button>
                </div>
            </div>

            <p v-else class="text-lg leading-relaxed text-stone-700">
                {{ post.content }}
            </p>

            <img
                v-if="post.image"
                ref="postImage"
                :src="post.image"
                alt="Imagen de la publicación"
                class="post-image mt-4"
                :class="{
                    'post-image--portrait': imageOrientation === 'portrait',
                    'post-image--landscape': imageOrientation === 'landscape',
                }"
                @load="handleImageLoad"
            >

            <div class="mt-5 flex items-center gap-4 border-t border-pet-100 pt-4">
                <button
                    type="button"
                    class="rounded-lg px-4 py-2 text-sm font-semibold transition"
                    :class="userLiked
                        ? 'bg-pet-100 text-pet-700 ring-1 ring-pet-300'
                        : 'bg-pet-50 text-pet-700 hover:bg-pet-100'"
                    @click="handleLike"
                >
                    {{ userLiked ? 'Te gusta' : 'Me gusta' }}
                </button>

                <span class="text-sm text-stone-500">
                    {{ likes.length }} me gusta
                </span>
            </div>
        </section>

        <section class="border-t border-pet-100 bg-pet-50 p-5">
            <h3 class="mb-4 font-bold text-pet-800">
                Comentarios ({{ comments.length }})
            </h3>

            <p v-if="error" role="alert" class="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {{ error }}
            </p>

            <ul v-if="comments.length" class="mb-4 space-y-2">
                <li
                    v-for="comment in comments"
                    :key="comment.id"
                    class="rounded-lg bg-white px-4 py-3 text-sm ring-1 ring-pet-100"
                >
                    <strong class="text-pet-700">
                        {{ comment.profiles?.username || 'Usuario' }}
                    </strong>
                    <span class="text-stone-600">: {{ comment.content }}</span>
                </li>
            </ul>

            <p v-else class="mb-4 text-sm text-stone-500">
                Sin comentarios.
            </p>

            <form class="flex gap-2" @submit.prevent="handleComment" novalidate>
                <label :for="'comment-' + post.id" class="sr-only">
                    Nuevo comentario
                </label>
                <input
                    :id="'comment-' + post.id"
                    v-model="newComment"
                    class="pet-input flex-1"
                    type="text"
                    name="comment"
                    placeholder="Comentar..."
                >

                <button type="submit" class="pet-btn-primary shrink-0 px-5">
                    Enviar
                </button>
            </form>
        </section>
    </article>
</template>

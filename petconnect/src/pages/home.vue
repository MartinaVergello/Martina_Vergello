<script>
import { subscribeToAuth, getCurrentUser } from '../services/Auth';

export default {
    name: 'Home',

    data() {
        return {
            user: null,
            unsubscribeAuth: null,
        };
    },

    async mounted() {
        this.user = await getCurrentUser();

        this.unsubscribeAuth = subscribeToAuth((user) => {
            this.user = user;
        });
    },

    unmounted() {
        if (this.unsubscribeAuth) {
            this.unsubscribeAuth();
        }
    },
};
</script>

<template>
    <main class="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <section class="pet-card p-8 sm:p-10">
            <h1 class="text-4xl font-bold text-pet-800 sm:text-5xl">
                PetConnect
            </h1>

            <p class="mt-4 text-lg leading-relaxed text-stone-600">
                Acá subimos fotos y cosas de nuestras mascotas. Podés comentar,
                dar me gusta y ver el perfil de otros usuarios.
            </p>

            <ul class="mt-6 space-y-2 text-stone-600">
                <li>Publicaciones de texto e imágenes</li>
                <li>Comentarios y me gusta (se actualizan solos en tiempo real)</li>
                <li>Perfil con nombre de usuario, biografía y foto</li>
            </ul>

            <div class="mt-8 flex flex-wrap gap-3">
                <RouterLink to="/feed" class="pet-btn-primary">
                    Ver publicaciones
                </RouterLink>

                <RouterLink v-if="user" to="/mi-perfil" class="pet-btn-secondary">
                    Mi perfil
                </RouterLink>
                <RouterLink v-if="!user" to="/login" class="pet-btn-secondary">
                    Ingresar
                </RouterLink>
                <RouterLink v-if="!user" to="/registro" class="pet-btn-secondary">
                    Registrarse
                </RouterLink>
            </div>
        </section>
    </main>
</template>

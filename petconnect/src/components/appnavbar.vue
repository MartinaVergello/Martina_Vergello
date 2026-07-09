<script>
import { subscribeToAuth, logout, getCurrentUser } from '../services/Auth';

export default {
    name: 'AppNavbar',

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

    methods: {
        async handleLogout() {
            await logout();
            this.$router.push('/');
        },
    },
};
</script>

<template>
    <header class="sticky top-0 z-50 border-b border-pet-600/20 bg-pet-500 text-white shadow-md">
        <nav aria-label="Navegación principal" class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <RouterLink to="/" class="font-display text-xl font-bold sm:text-2xl">
                PetConnect
            </RouterLink>

            <div class="flex flex-wrap items-center justify-end gap-1 text-sm sm:gap-2">
                <RouterLink to="/" class="nav-link">Inicio</RouterLink>
                <RouterLink to="/feed" class="nav-link">Publicaciones</RouterLink>

                <RouterLink v-if="user" to="/mi-perfil" class="nav-link">Mi perfil</RouterLink>
                <button v-if="user" type="button" class="nav-link" @click="handleLogout">
                    Salir
                </button>

                <RouterLink v-if="!user" to="/login" class="nav-link">Ingresar</RouterLink>
                <RouterLink
                    v-if="!user"
                    to="/registro"
                    class="rounded-lg bg-white px-4 py-2 font-bold text-pet-600 transition hover:bg-pet-50"
                >
                    Registrarse
                </RouterLink>
            </div>
        </nav>
    </header>
</template>

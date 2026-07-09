<script>
import { login, getAuthErrorMessage } from '../services/Auth';

export default {
    name: 'Login',
    data() {
        return {
            email: '',
            password: '',
            loading: false,
            error: '',
        };
    },
    methods: {
        async handleSubmit() {
            this.loading = true;
            this.error = '';

            try {
                await login(this.email, this.password);
                this.$router.push('/feed');
            } catch (error) {
                this.error = getAuthErrorMessage(error);
            }

            this.loading = false;
        },
    },
};
</script>

<template>
    <main class="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-10 sm:px-6">
        <section class="pet-card w-full p-6 sm:p-8">
            <h1 class="section-title mb-6 text-center">
                Iniciar sesión
            </h1>

            <form class="space-y-4" @submit.prevent="handleSubmit" novalidate>
                <div>
                    <label for="login-email" class="mb-2 block font-bold text-pet-800">Correo electrónico</label>
                    <input
                        id="login-email"
                        v-model="email"
                        class="pet-input"
                        type="email"
                        name="email"
                        autocomplete="email"
                        placeholder="tu@email.com"
                        required
                    >
                </div>

                <div>
                    <label for="login-password" class="mb-2 block font-bold text-pet-800">Contraseña</label>
                    <input
                        id="login-password"
                        v-model="password"
                        class="pet-input"
                        type="password"
                        name="password"
                        autocomplete="current-password"
                        required
                    >
                </div>

                <p v-if="error" role="alert" class="rounded-lg bg-red-50 px-4 py-3 text-red-700">
                    {{ error }}
                </p>

                <button type="submit" class="pet-btn-primary w-full">
                    {{ loading ? 'Entrando...' : 'Entrar' }}
                </button>

                <p class="text-center text-sm text-stone-500">
                    ¿No tenés cuenta?
                    <RouterLink to="/registro" class="font-bold text-pet-600 hover:underline">
                        Registrate
                    </RouterLink>
                </p>
            </form>
        </section>
    </main>
</template>

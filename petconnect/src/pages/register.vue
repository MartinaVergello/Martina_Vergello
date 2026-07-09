<script>
import { register, getAuthErrorMessage } from '../services/Auth';

export default {
    name: 'Register',
    data() {
        return {
            username: '',
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
                await register(this.email, this.password, this.username);
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
                Crear cuenta
            </h1>

            <form class="space-y-4" @submit.prevent="handleSubmit" novalidate>
                <div>
                    <label for="register-username" class="mb-2 block font-bold text-pet-800">Usuario</label>
                    <input
                        id="register-username"
                        v-model="username"
                        class="pet-input"
                        type="text"
                        name="username"
                        autocomplete="username"
                        placeholder="martina"
                        required
                    >
                </div>

                <div>
                    <label for="register-email" class="mb-2 block font-bold text-pet-800">Correo electrónico</label>
                    <input
                        id="register-email"
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
                    <label for="register-password" class="mb-2 block font-bold text-pet-800">Contraseña</label>
                    <input
                        id="register-password"
                        v-model="password"
                        class="pet-input"
                        type="password"
                        name="password"
                        autocomplete="new-password"
                        minlength="6"
                        required
                    >
                </div>

                <p v-if="error" role="alert" class="rounded-lg bg-red-50 px-4 py-3 text-red-700">
                    {{ error }}
                </p>

                <button type="submit" class="pet-btn-primary w-full">
                    {{ loading ? 'Creando...' : 'Crear cuenta' }}
                </button>

                <p class="text-center text-sm text-stone-500">
                    ¿Ya tenés cuenta?
                    <RouterLink to="/login" class="font-bold text-pet-600 hover:underline">
                        Entrar
                    </RouterLink>
                </p>
            </form>
        </section>
    </main>
</template>

<script>
import { login } from '../services/auth';

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
                this.error = error.message;
            }

            this.loading = false;
        },
    },
};
</script>

<template>
    <main class="mx-auto max-w-md p-6">
        <h1 class="mb-4 text-2xl font-bold">Iniciar sesión</h1>

        <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
                <label class="mb-1 block">Email</label>
                <input v-model="email" class="w-full rounded border p-2" type="email">
            </div>

            <div>
                <label class="mb-1 block">Contraseña</label>
                <input v-model="password" class="w-full rounded border p-2" type="password">
            </div>

            <p v-if="error" class="text-red-600">{{ error }}</p>

            <button class="rounded bg-orange-500 px-4 py-2 text-white">
                {{ loading ? 'Ingresando...' : 'Ingresar' }}
            </button>
        </form>
    </main>
</template>
<script>
import { register } from '../services/auth';
import { createProfile } from '../services/profiles';

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
                const user = await register(this.email, this.password);
                await createProfile(user.id, this.username);

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
        <h1 class="mb-4 text-2xl font-bold">Crear cuenta</h1>

        <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
                <label class="mb-1 block">Nombre de usuario</label>
                <input v-model="username" class="w-full rounded border p-2" type="text">
            </div>

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
                {{ loading ? 'Creando...' : 'Registrarme' }}
            </button>
        </form>
    </main>
</template>
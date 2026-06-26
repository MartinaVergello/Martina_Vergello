<template>
    <header class="bg-orange-500 text-white">
        <nav class="mx-auto flex max-w-5xl items-center justify-between p-4">
            <RouterLink to="/" class="text-xl font-bold">
                PetConnect
            </RouterLink>

            <div class="flex gap-4 text-sm">
                <RouterLink to="/">Inicio</RouterLink>
                <RouterLink to="/feed">Feed</RouterLink>
                <RouterLink to="/login">Ingresar</RouterLink>
                <RouterLink to="/registro">Registro</RouterLink>
                <RouterLink to="/mi-perfil">Mi perfil</RouterLink>
            </div>
        </nav>
    </header>
</template>
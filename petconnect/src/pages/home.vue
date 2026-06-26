<template>
    <main class="mx-auto max-w-4xl p-6">
        <section class="rounded bg-orange-50 p-6">
            <h1 class="mb-3 text-3xl font-bold text-orange-600">
                PetConnect
            </h1>

            <p class="mb-4 text-gray-700">
                Una red social para compartir fotos, historias y momentos de tus mascotas.
            </p>

            <RouterLink
                to="/feed"
                class="inline-block rounded bg-orange-500 px-4 py-2 text-white"
            >
                Ver publicaciones
            </RouterLink>
        </section>
    </main>
</template>
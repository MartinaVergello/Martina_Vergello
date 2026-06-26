<script>
import AppNavbar from './components/appnavbar.vue';

export default {
    name: 'App',
    components: { AppNavbar },
};
</script>

<template>
    <AppNavbar />
    <RouterView />
</template>
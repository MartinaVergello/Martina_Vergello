<script>
import AppNavbar from './components/AppNavbar.vue';
import AppFooter from './components/AppFooter.vue';

export default {
    name: 'App',
    components: { AppNavbar, AppFooter },
};
</script>

<template>
    <AppNavbar />

    <div class="flex-1">
        <RouterView />
    </div>

    <AppFooter />
</template>

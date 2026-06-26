import { createRouter, createWebHistory } from 'vue-router';

import Home from '../pages/home.vue';
import Login from '../pages/login.vue';
import Register from '../pages/register.vue';
import Feed from '../pages/feed.vue';
import MyProfile from '../pages/myprofile.vue';
import UserProfile from '../pages/userprofile.vue';

const routes = [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/registro', component: Register },
    { path: '/feed', component: Feed },
    { path: '/mi-perfil', component: MyProfile },
    { path: '/usuario/:id', component: UserProfile },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
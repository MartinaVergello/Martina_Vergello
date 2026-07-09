import { createRouter, createWebHistory } from 'vue-router';

import Home from '../pages/Home.vue';
import Login from '../pages/Login.vue';
import Register from '../pages/Register.vue';
import Feed from '../pages/Feed.vue';
import MyProfile from '../pages/MyProfile.vue';
import UserProfile from '../pages/UserProfile.vue';

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

import { createApp } from 'vue';
import App from './App.vue';
import router from './router/Router';

import './style.css';

createApp(App)
    .use(router)
    .mount('#app');

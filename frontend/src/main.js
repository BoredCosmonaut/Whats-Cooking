import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/reset.css'
import './assets/global-toast.css';
import Vue3Toastify from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

const app = createApp(App);
app.use(router)

app.use(Vue3Toastify, {
  autoClose: 3000,
  position: 'top-right', // Sağ üst köşe her zaman daha temiz durur
  theme: 'colored', // Senin yeşil temana uyum sağlaması için
});

app.mount('#app');

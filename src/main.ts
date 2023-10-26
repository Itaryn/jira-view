import './assets/theme.css';

import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';

createApp(App).use(PrimeVue).use(ToastService).mount('#app')

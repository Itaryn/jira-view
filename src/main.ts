import './assets/theme.css';

import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';
import type { Config } from './models/config.model';

const app = createApp(App)

app.use(PrimeVue).use(ToastService)
app.directive('tooltip', Tooltip)

fetch("config.json")
  .then((response) => response.json())
  .then((config: Config) => {
        app.config.globalProperties.config = config
        app.mount('#app')
  });
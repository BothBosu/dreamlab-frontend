// src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import axios from 'axios';

// Configure Axios
// local
axios.defaults.baseURL = 'http://localhost:8080';
// deploy
// axios.defaults.baseURL = 'https://dreamlab-ai.online'

axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.withCredentials = true;

// Create the application
const app = createApp(App);

// Use Pinia for state management
app.use(createPinia());

// Use the router
app.use(router);

// Mount the application
app.mount('#app');

// src/main.js
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import axios from 'axios';

// Configure Axios
axios.defaults.baseURL = 'http://localhost:8080';
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

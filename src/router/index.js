// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import LoginView from '@/views/LoginView.vue';

// Placeholder for Dashboard
const DashboardView = {
  template: '<div>Dashboard (Protected Page)</div>'
};

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Navigation guard for authentication
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthenticated = authStore.isAuthenticated;

  // If not authenticated, check auth status with backend
  if (!isAuthenticated) {
    await authStore.checkAuthStatus();
  }

  if (requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login if trying to access a protected route
    next({ name: 'login' });
  } else if (to.name === 'login' && authStore.isAuthenticated) {
    // Redirect to dashboard if already logged in
    next({ name: 'dashboard' });
  } else {
    // Otherwise proceed normally
    next();
  }
});

export default router;

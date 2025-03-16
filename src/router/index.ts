// src/router/index.ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import GalleryView from '@/views/GalleryView.vue'
import ImageGenView from '@/views/ImageGenView.vue'
import ErrorView from '@/views/ErrorView.vue'

// Placeholder for Dashboard
const DashboardView = {
  template: '<div class="dashboard-container"><h1>Dashboard (Protected Page)</h1><p>Welcome to the futuristic dashboard.</p></div>',
  setup() {
    return {}
  }
}

/**
 * TODO: Don't forget to change the requiresAuth meta to true when actually deploying the app
 */
const routes: Array<RouteRecordRaw> = [
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
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: false }
  },
  {
    path: '/gallery',
    name: 'gallery',
    component: GalleryView,
    meta: { requiresAuth: false }
  },
  {
    path: '/imagegen',
    name: 'imagegen',
    component: ImageGenView,
    meta: { requiresAuth: false }
  },
  {
    /**
     * Catch-all route for 404 errors
     * This catch-all route must be placed last
     */
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: ErrorView,
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guard for authentication
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = authStore.isAuthenticated

  // If not authenticated, check auth status with backend
  if (!isAuthenticated) {
    await authStore.checkAuthStatus()
  }

  if (requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login if trying to access a protected route
    next({ name: 'login' })
  } else if ((to.name === 'login' || to.name === 'register') && authStore.isAuthenticated) {
    // Redirect to dashboard if already logged in
    next({ name: 'dashboard' })
  } else {
    // Otherwise proceed normally
    next()
  }
})

export default router

import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import GalleryView from '@/views/GalleryView.vue'
import ImageGenView from '@/views/ImageGenView.vue'
import ErrorView from '@/views/ErrorView.vue'
import LandingView from '@/views/LandingView.vue'
import DashboardView from '@/views/DashboardView.vue'
import UserProfileView from '@/views/UserProfileView.vue'

/**
 * TODO: Don't forget to change the requiresAuth meta to true when actually deploying the app
 */
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'landing',
    component: LandingView,
    meta: { requiresAuth: false }
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
    path: '/profile',
    name: 'profile',
    component: UserProfileView,
    meta: { requiresAuth: true }
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
  // Fix for import.meta.env error
  history: createWebHistory((import.meta as any).env.BASE_URL),
  routes
})

// Navigation guard for authentication
// Fix for 'from' parameter by using underscore to indicate unused parameter
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = authStore.isAuthenticated

  // If not authenticated, check auth status with backend
  if (!isAuthenticated) {
    await authStore.checkAuthStatus()
  }

  if (to.matched.some(record => record.meta.requiresAuth)) {
    // Check if the user is authenticated
    if (!authStore.isAuthenticated) {
      // Redirect to login page if not authenticated
      next({ name: 'login' });
    } else {
      // Allow access if authenticated
      next();
    }
  } else {
    // Allow access to non-protected routes
    next();
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

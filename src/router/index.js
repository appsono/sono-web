import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import * as api from '@/services/api'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Auth/LoginView.vue'),
    meta: { requiresGuest: true, title: 'Login' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Auth/RegisterView.vue'),
    meta: { requiresGuest: true, title: 'Register' }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/Auth/ForgotPasswordView.vue'),
    meta: { requiresGuest: true, title: 'Login' }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/views/Auth/ResetPasswordView.vue'),
    meta: { requiresGuest: true, title: 'Login' }
  },
  {
    path: '/',
    name: 'Library',
    component: () => import('@/views/LibraryView.vue'),
    meta: { requiresAuth: true, title: 'Library' }
  },
  {
    path: '/browse',
    name: 'Browse',
    component: () => import('@/views/BrowseView.vue'),
    meta: { requiresAuth: true, title: 'Browse' }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/SearchView.vue'),
    meta: { requiresAuth: true, title: 'Search' }
  },
  {
    path: '/news',
    name: 'News',
    component: () => import('@/views/NewsView.vue'),
    meta: { requiresAuth: true, title: 'News' }
  },
  {
    path: '/collection/:id',
    name: 'Collection',
    component: () => import('@/views/CollectionView.vue'),
    meta: { requiresAuth: true, title: 'Collection' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true, title: 'Profile' }
  },
  {
    path: '/settings/deletion-status',
    name: 'DeletionStatus',
    component: () => import('@/views/DeletionStatusView.vue'),
    meta: { requiresAuth: true, title: 'Account deletion' }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/AdminView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, title: 'Admin' }
  },
  {
    path: '/credits',
    name: 'Credits',
    component: () => import('@/views/CreditsView.vue'),
    meta: { requiresAuth: true, title: 'Credits' }
  },
  {
    path: '/maintenance',
    name: 'Maintenance',
    component: () => import('@/views/MaintenanceView.vue'),
    meta: { title: 'Under Maintenance' }
  },
  {
    path: '/delete-account',
    redirect: { name: 'Profile', query: { openDelete: 'true' } }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  //check maintenance mode FIRST => skip for maintenance page
  let maintenanceEnabled = false
  if (to.name !== 'Maintenance') {
    try {
      const response = await api.getMaintenanceStatus()
      maintenanceEnabled = response.data.enabled

      if (maintenanceEnabled) {
        //maintenance is enabled
        //try to init auth if user is already loaded or need to check admin status
        if (authStore.user && authStore.isSuperuser) {
          //admin is already logged in => let through
        } else if (!authStore.user && localStorage.getItem('access_token')) {
          //try init auth to see if admin
          //API will allow admin tokens through
          try {
            await authStore.initializeAuth()
            //successfully initialized => check if admin
            if (!authStore.isSuperuser) {
              next({ name: 'Maintenance' })
              return
            }
          } catch (err) {
            //auth failed (likely 503 for non-admin) => show maintenance
            next({ name: 'Maintenance' })
            return
          }
        } else {
          //no user and no token => or user is not admin
          next({ name: 'Maintenance' })
          return
        }
      }
    } catch (err) {
      console.error('Failed to check maintenance status:', err)
    }
  }

  //if on maintenance page but maintenance is disabled => redirect appropriately
  if (to.name === 'Maintenance') {
    try {
      const response = await api.getMaintenanceStatus()
      if (!response.data.enabled) {
        const hasToken = !!localStorage.getItem('access_token')
        if (hasToken && authStore.isAuthenticated) {
          next({ name: 'Library' })
        } else {
          next({ name: 'Login' })
        }
        return
      }
    } catch (err) {
      console.error('Failed to check maintenance status:', err)
    }
  }

  //initialize auth for normal operation (not during maintenance)
  if (!maintenanceEnabled && !authStore.user && localStorage.getItem('access_token')) {
    try {
      await authStore.initializeAuth()
    } catch (err) {
      console.error('Auth initialization failed:', err)
    }
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({ name: 'Library' })
    return
  }

  if (to.meta.requiresAdmin && !authStore.isSuperuser) {
    next({ name: 'Library' })
    return
  }

  next()
})

router.afterEach((to) => {
  const title = to.meta.title || ''
  document.title = `${title} • Sono Web`
})

export default router
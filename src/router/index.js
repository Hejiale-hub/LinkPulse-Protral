import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import MonitorView from '../views/MonitorView.vue'
import HelpCenterView from '../views/HelpCenterView.vue'
import PrivacyPolicyView from '../views/PrivacyPolicyView.vue'
import { STORAGE_KEYS } from '../constants/storage-keys'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/monitor',
    name: 'monitor',
    component: MonitorView
  },
  {
    path: '/help',
    name: 'help',
    component: HelpCenterView
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: PrivacyPolicyView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const hasToken = Boolean(localStorage.getItem(STORAGE_KEYS.token))

  if (to.meta?.requiresAuth && !hasToken) {
    next({
      name: 'login',
      query: {
        redirect: to.fullPath
      }
    })
    return
  }

  if (to.name === 'login' && hasToken) {
    next({ name: 'home' })
    return
  }

  next()
})

export default router
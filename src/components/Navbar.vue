<template>
  <nav class="navbar">
    <router-link to="/" class="nav-logo">LinkPulse.</router-link>

    <div class="nav-tabs">
      <router-link to="/" class="nav-tab" :class="{ active: $route.path === '/' }">Home</router-link>
      <router-link to="/monitor" class="nav-tab" :class="{ active: $route.path === '/monitor' }">Monitor</router-link>
    </div>

    <div class="nav-auth">
      <template v-if="isLoggedIn">
        <div class="user-entry" aria-label="当前用户">
          <img :src="avatarUrl" alt="用户头像" class="avatar" />
        </div>
        <button class="btn-login" type="button" @click="handleLogout">退出</button>
      </template>
      <router-link v-else to="/login" class="btn-register">登录</router-link>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { notifySuccess } from '../utils/notify'

const route = useRoute()
const router = useRouter()
const { token, isLoggedIn, logout } = useAuth()

const avatarUrl = computed(() => {
  const seed = token.value ? token.value.slice(0, 12) : 'guest'
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(seed)}`
})

const handleLogout = () => {
  logout()
  notifySuccess('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 84px;
  background-color: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 5%;
  z-index: 1000;
  border-bottom: 1px solid #eef2f7;
}

.nav-tabs {
  display: flex;
  gap: 6px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.nav-tab {
  text-decoration: none;
  color: #64748b;
  font-weight: 600;
  font-size: 14px;
  padding: 7px 18px;
  border-radius: 50px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-tab:hover {
  color: #0f172a;
  background-color: #f1f5f9;
  transform: scale(1.02);
}

.nav-tab:active {
  transform: scale(0.96);
}

.nav-tab.active {
  background-color: #0f172a;
  color: #ffffff;
  transform: none;
}

.nav-logo {
  font-size: 28px;
  font-weight: 900;
  color: #000000;
  text-decoration: none;
  letter-spacing: -0.5px;
}

.nav-links {
  display: flex;
  gap: 34px;
}

.nav-links a {
  text-decoration: none;
  color: #000000;
  font-weight: 600;
  font-size: 15px;
  transition: opacity 0.25s;
}

.nav-links a.router-link-active,
.nav-links a:hover {
  opacity: 0.55;
}

.nav-auth {
  display: flex;
  align-items: center;
  gap: 14px;
}

.nav-auth .btn-login {
  background: none;
  border: none;
  text-decoration: none;
  color: #000000;
  font-weight: 600;
  font-size: 15px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 50px;
}

.nav-auth .btn-login:hover {
  color: #334155;
  background-color: #f8fafc;
  transform: scale(1.02);
}

.nav-auth .btn-login:active {
  transform: scale(0.96);
}

.nav-auth .btn-register {
  background-color: #000000;
  color: #ffffff;
  padding: 10px 22px;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  font-size: 15px;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.nav-auth .btn-register:hover {
  background-color: #1e293b;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.nav-auth .btn-register:active {
  transform: translateY(0) scale(0.96);
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
}

.user-entry {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #0f172a;
  font-weight: 600;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
}

@media (max-width: 860px) {
  .navbar {
    height: 74px;
    padding: 0 16px;
  }

  .nav-links {
    display: none;
  }
}
</style>
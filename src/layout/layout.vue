<template>
  <div class="app-wrapper">
    <header class="navbar">
      <div class="nav-container">
        <div class="logo" @click="router.push('/')">
          EduPlatform.
        </div>

        <nav class="nav-links">
          <router-link to="/">首页 (Beranda)</router-link>
          <router-link to="/courses">课程 (Kursus)</router-link>
          <router-link to="/pricing">价格 (Harga)</router-link>
        </nav>

        <div class="user-actions">
          <template v-if="isLoggedIn">
            <div class="user-profile">
              <img :src="userInfo.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'" alt="avatar" class="avatar" />
              <span class="username">{{ userInfo.name }}</span>
            </div>
            <button class="btn-logout" @click="handleLogout">退出</button>
          </template>

          <template v-else>
            <button class="btn-text" @click="router.push('/login')">登录 (Login)</button>
            <button class="btn-black" @click="router.push('/login')">注册 (Daftar)</button>
          </template>
        </div>
      </div>
    </header>

    <main class="main-content">
      <router-view />
    </main>

    <footer class="footer">
      <p>&copy; 2026 EduPlatform. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUserInfoAPI, logoutAPI } from '../api/user'
import { notifySuccess } from '../utils/notify'

const router = useRouter()

// 状态定义
const isLoggedIn = ref(false)
const userInfo = ref({})

// 页面一加载，就去检查有没有登录
onMounted(async () => {
  const token = localStorage.getItem('token')
  if (token) {
    try {
      // 携带 Token 去后端获取真实的用户信息
      const res = await getUserInfoAPI()
      if (res.code === 1) {
        isLoggedIn.value = true
        userInfo.value = res.data
      }
    } catch (error) {
      console.error('获取用户信息失败，Token可能已过期', error)
      // 如果后端报错（比如 Token 过期），清空错误状态
      handleLogout(false) // 传入 false 表示不调接口，只清本地
    }
  }
})

// 处理退出登录
const handleLogout = async (callApi = true) => {
  if (callApi) {
    try {
      await logoutAPI() // 告诉后端我退出了
    } catch (e) {
      console.log('后端登出接口异常，强制前端登出')
    }
  }
  // 清理前端状态
  localStorage.removeItem('token')
  isLoggedIn.value = false
  userInfo.value = {}
  notifySuccess('已安全退出！')
  router.push('/login')
}
</script>

<style scoped>
/* 整体布局包装器 */
.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8fafc; /* 非常淡的灰白色背景，区分出白色卡片 */
}

/* ================= 导航栏样式 ================= */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 70px;
  background-color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  z-index: 1000;
  display: flex;
  justify-content: center;
}

.nav-container {
  width: 100%;
  max-width: 1200px; /* 限制导航栏内容最大宽度，居中对齐 */
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Logo 极简风 */
.logo {
  font-size: 1.5rem;
  font-weight: 900;
  color: #000000;
  cursor: pointer;
  letter-spacing: -1px;
}

/* 中间导航链接 */
.nav-links {
  display: flex;
  gap: 30px;
}

.nav-links a {
  text-decoration: none;
  color: #64748b;
  font-size: 0.95rem;
  font-weight: 600;
  transition: color 0.3s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: #000000; /* 当前选中的菜单变成纯黑 */
}

/* 右侧操作区 */
.user-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.btn-text {
  background: transparent;
  border: none;
  color: #000000;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 8px 12px;
}

.btn-text:hover {
  text-decoration: underline;
}

.btn-black {
  background-color: #000000;
  color: #ffffff;
  border: none;
  padding: 8px 20px;
  font-size: 0.9rem;
  font-weight: bold;
  border-radius: 50px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-black:hover {
  background-color: #333333;
}

/* 已登录状态的用户信息 */
.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
}

.username {
  font-size: 0.9rem;
  font-weight: 600;
  color: #0f172a;
}

.btn-logout {
  background: transparent;
  border: 1px solid #e2e8f0;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  color: #64748b;
}

.btn-logout:hover {
  border-color: #ef4444;
  color: #ef4444;
}

/* ================= 主体内容区 ================= */
.main-content {
  flex: 1; /* 撑开中间区域，把 Footer 挤到最下面 */
  margin-top: 70px; /* 避开固定在顶部的导航栏 */
}

/* ================= 底部版权区 ================= */
.footer {
  text-align: center;
  padding: 30px;
  background-color: #ffffff;
  color: #94a3b8;
  font-size: 0.85rem;
  border-top: 1px solid #f1f5f9;
}
</style>
<template>
  <div id="app">
    <Navbar />
    <AppNotifications />

    <main class="main-content">
      <router-view></router-view>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue' // 引入我们刚刚写的 Footer 组件
import AppNotifications from './components/AppNotifications.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; 
}

body {
  background-color: #ffffff; 
  color: #0f172a;
  /* 解决极简风网页常见的滚动条跳动问题 */
  overflow-y: scroll; 
}

.main-content {
  min-height: 100vh;
}
</style>
<template>
  <footer class="site-footer">
    <div class="footer-content">
      <div class="footer-brand">
        <h2>LinkPulse.</h2>
        <p>构建一个智能的链接监控系统，帮助用户实时了解链接状态，及时发现并解决问题，提升用户体验和效率。</p>
      </div>

      <div class="footer-links-grid">
        <div class="link-column">
          <h3>导航</h3>
          <router-link to="/">首页</router-link>
          <router-link to="/login">登录注册</router-link>
        </div>

        <div class="link-column">
          <h3>支持</h3>
          <a href="#">帮助中心</a>
          <a href="#">隐私政策</a>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; 2026 LinkPulse. All rights reserved.</p>
      <div class="social-links">
        <a href="#">Twitter</a>
        <a href="#">Instagram</a>
        <a href="#">LinkedIn</a>
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
.site-footer {
  background-color: #000000; /* 纯黑背景，强烈的视觉锚点 */
  color: #ffffff; /* 纯白文字 */
  padding: 100px 5% 40px; /* 顶部留出巨大的空间 */
}

.footer-content {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap; /* 适配小屏幕 */
  gap: 60px;
  margin-bottom: 80px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

/* 左侧品牌区域 */
.footer-brand {
  flex: 1;
  min-width: 300px;
}

.footer-brand h2 {
  font-size: 3rem;
  font-weight: 900;
  margin-bottom: 20px;
  letter-spacing: -1px;
}

.footer-brand p {
  color: #a1a1aa; /* 灰白色，降低次要信息的视觉层级 */
  font-size: 1.1rem;
  line-height: 1.6;
  max-width: 400px;
}

/* 右侧链接网格 */
.footer-links-grid {
  display: flex;
  gap: 80px;
  flex-wrap: wrap;
}

.link-column {
  display: flex;
  flex-direction: column;
}

.link-column h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 25px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.link-column a {
  color: #a1a1aa;
  text-decoration: none;
  margin-bottom: 15px;
  font-size: 1rem;
  font-weight: 500;
  transition: color 0.3s, transform 0.3s;
}

/* 鼠标悬浮特效：文字变纯白并轻微右移 */
.link-column a:hover {
  color: #ffffff;
  transform: translateX(5px);
}

/* 底部版权区域 */
.footer-bottom {
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 40px;
  border-top: 1px solid #333333; /* 极暗的灰色分割线 */
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  color: #a1a1aa;
  font-size: 0.9rem;
}

.social-links {
  display: flex;
  gap: 20px;
}

.social-links a {
  color: #a1a1aa;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s;
}

.social-links a:hover {
  color: #ffffff;
}
</style>
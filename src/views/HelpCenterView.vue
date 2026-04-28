<template>
  <div class="help-page">
    <div class="help-container">
      <header class="page-header">
        <h1>帮助中心</h1>
        <p>在这里找到您需要的所有帮助和支持</p>
      </header>

      <div class="content-section">
        <section class="faq-section">
          <h2>常见问题 (FAQ)</h2>
          
          <div class="faq-item">
            <h3>如何创建一个短链接？</h3>
            <p>在首页输入您的原始长链接，点击"生成"按钮即可创建链接。如果您已登录，生成的链接将自动保存在您的监控列表中。</p>
          </div>

          <div class="faq-item">
            <h3>如何查看链接的点击数据？</h3>
            <p>登录后，点击顶部导航栏的"Monitor"进入监控页面，您可以查看所有链接的点击总数、趋势图表以及详细的访问记录。</p>
          </div>

          <div class="faq-item">
            <h3>生成的短链接会过期吗？</h3>
            <p>目前我们提供的短链接服务是永久有效的，除非您主动在监控面板中将其删除。</p>
          </div>
          
          <div class="faq-item">
            <h3>如何使用 AI 助手？</h3>
            <p>在监控页面右下角点击 "AI Chat" 按钮唤出 AI 助手，您可以上传 PDF、图片或直接提问，AI 将协助您分析数据或解答问题。</p>
          </div>
        </section>

        <section class="contact-section">
          <h2>联系我们</h2>
          <p>如果您在使用过程中遇到任何问题，或者有任何建议，欢迎通过以下方式联系我们：</p>
          <ul>
            <li><strong>Email:</strong> support@linkpulse.com</li>
            <li><strong>GitHub:</strong> <a href="https://github.com/Hejiale-hub/LinkPulse-backend.git" target="_blank" rel="noopener noreferrer">提交 Issue</a></li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
// Help Center Logic
</script>

<style scoped>
.help-page {
  min-height: calc(100vh - 84px);
  padding: 100px 5% 60px;
  background-color: #f8fafc;
}

.help-container {
  max-width: 800px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 24px;
  padding: 40px 50px;
  box-shadow: 0 10px 40px -10px rgba(15, 23, 42, 0.05);
}

.page-header {
  text-align: center;
  margin-bottom: 50px;
  padding-bottom: 30px;
  border-bottom: 1px solid #e2e8f0;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 15px;
  letter-spacing: -0.5px;
}

.page-header p {
  font-size: 1.1rem;
  color: #64748b;
}

.content-section section {
  margin-bottom: 40px;
}

.content-section h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 25px;
}

.faq-item {
  margin-bottom: 25px;
  padding: 20px;
  background: #f1f5f9;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.faq-item h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 10px;
}

.faq-item p {
  color: #475569;
  line-height: 1.6;
  font-size: 0.95rem;
}

.contact-section p {
  color: #475569;
  line-height: 1.6;
  margin-bottom: 15px;
}

.contact-section ul {
  list-style: none;
  padding: 0;
}

.contact-section li {
  margin-bottom: 10px;
  color: #334155;
  font-size: 1rem;
}

.contact-section a {
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
}

.contact-section a:hover {
  text-decoration: underline;
}

@media (max-width: 600px) {
  .help-container {
    padding: 30px 20px;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
}
</style>
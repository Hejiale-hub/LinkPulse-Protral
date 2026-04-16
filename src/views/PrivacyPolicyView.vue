<template>
  <div class="privacy-page">
    <div class="privacy-container">
      <header class="page-header">
        <h1>隐私政策</h1>
        <p>最后更新时间：2026年4月16日</p>
      </header>

      <div class="content-section">
        <section>
          <h2>1. 信息收集</h2>
          <p>当您使用 LinkPulse 服务时，我们可能会收集以下信息：</p>
          <ul>
            <li><strong>账户信息：</strong> 当您注册账户时提供的用户名、邮箱和密码。</li>
            <li><strong>链接数据：</strong> 您创建的原始链接及生成的短链接。</li>
            <li><strong>访问数据：</strong> 访客点击您的短链接时产生的 IP 地址、地理位置、浏览器类型、操作系统及访问时间。</li>
          </ul>
        </section>

        <section>
          <h2>2. 信息使用</h2>
          <p>我们收集的信息主要用于以下用途：</p>
          <ul>
            <li>提供、维护和改进我们的短链接生成及监控服务。</li>
            <li>为您生成详细的链接点击分析报告和图表。</li>
            <li>保障系统安全，防止滥用和欺诈行为。</li>
          </ul>
        </section>

        <section>
          <h2>3. 信息共享与披露</h2>
          <p>我们承诺保护您的隐私。除非获得您的明确同意，或在法律法规要求的情况下，我们不会向任何第三方出售、出租或交易您的个人信息及链接数据。</p>
        </section>

        <section>
          <h2>4. 数据安全</h2>
          <p>我们采取了合理的物理、技术和管理措施来保护您的个人信息，防止未经授权的访问、使用或泄露。但请注意，互联网传输无法保证 100% 的绝对安全。</p>
        </section>

        <section>
          <h2>5. 您的权利</h2>
          <p>您有权随时访问、更正或删除您的账户信息和生成的链接数据。您可以在控制面板中自行操作，或联系我们的支持团队寻求帮助。</p>
        </section>

        <section>
          <h2>6. 政策更新</h2>
          <p>我们可能会不时更新本隐私政策。任何重大变更，我们都将通过网站公告或邮件的形式通知您。继续使用我们的服务即表示您同意受更新后隐私政策的约束。</p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
// Privacy Policy Logic
</script>

<style scoped>
.privacy-page {
  min-height: calc(100vh - 84px);
  padding: 100px 5% 60px;
  background-color: #f8fafc;
}

.privacy-container {
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
  font-size: 1rem;
  color: #64748b;
}

.content-section section {
  margin-bottom: 35px;
}

.content-section h2 {
  font-size: 1.4rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f1f5f9;
}

.content-section p {
  color: #475569;
  line-height: 1.7;
  font-size: 1rem;
  margin-bottom: 15px;
}

.content-section ul {
  list-style-type: disc;
  padding-left: 25px;
  color: #475569;
  line-height: 1.7;
}

.content-section li {
  margin-bottom: 10px;
}

.content-section strong {
  color: #1e293b;
  font-weight: 600;
}

@media (max-width: 600px) {
  .privacy-container {
    padding: 30px 20px;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
}
</style>
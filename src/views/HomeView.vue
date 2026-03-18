<template>
  <div class="home-page">
    <header class="hero">
      <h1>START YOUR LINK MONITORING</h1>
      <p class="hero-subtitle">开始获取一个link code，并开始对其监控</p>
      <div class="hero-actions">
        <button class="btn-primary" type="button" @click="handlePrimaryAction" :disabled="isSubmitting">
          {{ isInputVisible ? (isSubmitting ? '创建中...' : '立即创建') : '立即开始' }}
        </button>
      </div>

      <transition name="fade-slide">
        <div v-if="isInputVisible" class="link-code-panel">
          <div class="input-group">
            <label class="link-code-label" for="original-url-input">Original URL</label>
            <input
              id="original-url-input"
              v-model.trim="originalUrl"
              class="link-code-input"
              type="url"
              name="link-original-url"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
              spellcheck="false"
              data-lpignore="true"
              placeholder="输入需要生成 link code 的原始链接"
              maxlength="500"
            />
          </div>

          <div class="input-group compact">
            <label class="link-code-label" for="link-title-input">Link Title</label>
            <input
              id="link-title-input"
              v-model.trim="linkTitle"
              class="link-code-input"
              type="text"
              name="link-title"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
              spellcheck="false"
              data-lpignore="true"
              placeholder="输入一个便于识别的链接标题"
              maxlength="50"
            />
          </div>
        </div>
      </transition>

      <section v-if="linkCodeStore.length" class="repo-section">
        <div class="repo-header">
          <h2>LinkCode Store</h2>
          <span>{{ linkCodeStore.length }} 条记录</span>
        </div>

        <div class="repo-list">
          <article v-for="(item, index) in linkCodeStore" :key="`${item.linkCode}-${index}`" class="repo-item">
            <div class="repo-item-index">#{{ index + 1 }}</div>
            <div class="repo-item-main">
              <p class="repo-item-title">{{ item.linkTitle || '未命名链接' }}</p>
              <p class="repo-item-code">{{ item.linkCode || '-' }}</p>
            </div>
          </article>
        </div>
      </section>
    </header>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createLinkCodeAPI } from '../api/user'
import { notifyError, notifyInfo, notifySuccess } from '../utils/notify'
import { notifyErrorOnce } from '../utils/error-handler'
import { useAuth } from '../composables/useAuth'

const isInputVisible = ref(false)
const isSubmitting = ref(false)
const originalUrl = ref('')
const linkTitle = ref('')
const linkCodeStore = ref([])
const router = useRouter()
const { isLoggedIn } = useAuth()

const normalizeLinkCodeList = (data) => {
  if (Array.isArray(data)) {
    return data.map((item) => ({
      linkTitle: String(item?.linkTitle || ''),
      linkCode: String(item?.linkCode || '')
    }))
  }

  if (data && typeof data === 'object') {
    return [{
      linkTitle: String(data?.linkTitle || ''),
      linkCode: String(data?.linkCode || '')
    }]
  }

  return []
}

const handlePrimaryAction = async () => {
  if (!isLoggedIn.value) {
    notifyInfo('请先登录')
    return
  }

  if (!isInputVisible.value) {
    isInputVisible.value = true
    return
  }

  if (!originalUrl.value) {
    notifyError('请输入原始链接')
    return
  }

  if (!linkTitle.value) {
    notifyError('请输入链接标题')
    return
  }

  isSubmitting.value = true

  try {
    const data = await createLinkCodeAPI({
      originalUrl: originalUrl.value,
      linkTitle: linkTitle.value
    })
    const normalized = normalizeLinkCodeList(data)
    linkCodeStore.value = normalized

    if (!linkCodeStore.value.length) {
      notifyError('返回结果为空，请检查后端返回 data 是否为列表')
      return
    }

    notifySuccess('Link code 创建成功')
  } catch (error) {
    notifyErrorOnce(error, '创建失败，请稍后重试')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.hero {
  text-align: center;
  padding: 160px 5% 120px;
}

.hero h1 {
  font-size: 4.4rem;
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 20px;
  letter-spacing: -2px;
}

.hero-subtitle {
  color: #64748b;
  font-size: 1.1rem;
  margin-bottom: 48px;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 14px;
}

.btn-primary {
  background-color: #000000;
  color: #ffffff;
  padding: 14px 36px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: opacity 0.25s;
}

.btn-primary:disabled {
  opacity: 0.75;
  cursor: wait;
}

.btn-primary:hover {
  opacity: 0.75;
}

.link-code-panel {
  width: min(100%, 520px);
  margin: 22px auto 0;
  padding: 22px 24px;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
  text-align: left;
}

.input-group {
  margin-bottom: 20px;
}

.input-group.compact {
  margin-bottom: 0;
}

.link-code-label {
  display: block;
  margin-bottom: 12px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.link-code-input {
  width: 100%;
  border: none;
  border-bottom: 2px solid #e2e8f0;
  padding: 12px 0;
  font-size: 1.05rem;
  color: #0f172a;
  background: transparent;
  outline: none;
  transition: border-color 0.25s;
}

.link-code-input:focus {
  border-bottom-color: #000000;
}

.create-result {
  margin-top: 18px;
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 600;
}

.repo-section {
  width: min(100%, 760px);
  margin: 32px auto 0;
  padding: 22px 24px;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 20px 48px rgba(15, 23, 42, 0.08);
  text-align: left;
}

.repo-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 16px;
  gap: 8px;
}

.repo-header h2 {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
}

.repo-header span {
  font-size: 0.88rem;
  color: #64748b;
  font-weight: 600;
}

.repo-list {
  display: grid;
  gap: 10px;
}

.repo-item {
  display: flex;
  align-items: center;
  gap: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 12px 14px;
  background: #ffffff;
}

.repo-item-index {
  width: 52px;
  height: 32px;
  border-radius: 999px;
  background: #f8fafc;
  color: #334155;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.82rem;
  font-weight: 700;
  flex-shrink: 0;
}

.repo-item-main {
  width: 100%;
  min-width: 0;
}

.repo-item-title {
  margin: 0;
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.35;
}

.repo-item-code {
  margin: 4px 0 0;
  color: #475569;
  font-size: 0.88rem;
  font-family: 'Consolas', 'Courier New', monospace;
  word-break: break-all;
  line-height: 1.35;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 640px) {
  .hero {
    padding-top: 120px;
  }

  .hero h1 {
    font-size: 3rem;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .link-code-panel {
    padding: 18px 18px 16px;
  }

  .repo-section {
    padding: 18px;
  }

  .repo-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
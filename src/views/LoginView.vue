<template>
  <div class="login-page">
    <div class="login-container">
      
      <div class="login-header">
        <h1>{{ isLoginMode ? '欢迎回来' : '创建新账号' }}</h1>
        <p>{{ isLoginMode ? '请输入您的账号密码进行登录' : '请填写手机号和密码完成注册' }}</p>
      </div>

      <form @submit.prevent="handleSubmit">
        
        <div class="input-group" v-if="isLoginMode">
          <label>账号</label>
          <input type="text" v-model="formData.account" placeholder="请输入账号" required />
        </div>

        <div class="input-group" v-if="!isLoginMode">
          <label>手机号</label>
          <input type="tel" v-model="formData.account" placeholder="请输入手机号" required />
        </div>

        <div class="input-group">
          <label>密码</label>
          <input type="password" v-model="formData.password" placeholder="请输入密码" required />
        </div>

        <div class="form-options" :class="{ placeholder: !isLoginMode }">
          <template v-if="isLoginMode">
            <label class="remember">
              <input type="checkbox" /> 记住我
            </label>
            <a href="#" class="forgot-password">忘记密码？</a>
          </template>
        </div>

        <button type="submit" class="btn-submit">
          {{ isLoginMode ? '登 录' : '注 册' }}
        </button>
      </form>

      <div class="login-footer">
        <span v-if="isLoginMode">
          还没有账号？ <a href="#" @click.prevent="toggleMode">立即注册</a>
        </span>
        <span v-else>
          已有账号？ <a href="#" @click.prevent="toggleMode">返回登录</a>
        </span>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { notifySuccess } from '../utils/notify'
import { notifyErrorOnce } from '../utils/error-handler'

const router = useRouter()
const route = useRoute()
const isLoginMode = ref(true)
const { login, register } = useAuth()

const formData = ref({
  account: '',
  password: ''
})

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value
  formData.value = { account: '', password: '' }
}

// 提交表单
const handleSubmit = async () => {
  try {
    if (!isLoginMode.value) {
      await register({
        account: formData.value.account,
        password: formData.value.password
      })
      notifySuccess('注册成功，请登录。')
      toggleMode()
    } else {
      await login({
        account: formData.value.account,
        password: formData.value.password
      })
      const redirect = String(route.query.redirect || '/')
      router.push(redirect)
    }
  } catch (error) {
    notifyErrorOnce(error)
  }
}
</script>

<style scoped>
/* 基础布局代码保持不变 */
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  padding: 100px 20px 40px;
}

.login-container {
  width: 100%;
  max-width: 420px;
}

.login-header {
  min-height: 122px;
  margin-bottom: 42px;
}

.login-header h1 {
  font-size: 3rem;
  font-weight: 900;
  color: #000000;
  letter-spacing: -2px;
  line-height: 1;
  margin-bottom: 15px;
}

.login-header p {
  color: #64748b;
  font-size: 1.1rem;
  max-width: 320px;
  min-height: 52px;
  line-height: 1.5;
}

.input-group {
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
}

.input-group label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #000000;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* 常规输入框样式 */
.input-group input {
  border: none;
  border-bottom: 2px solid #e2e8f0;
  padding: 10px 0;
  font-size: 1.1rem;
  color: #0f172a;
  background-color: transparent;
  outline: none;
  transition: border-color 0.3s;
}

.input-group input:focus {
  border-bottom: 2px solid #000000;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  font-size: 0.9rem;
  min-height: 24px;
}

.form-options.placeholder {
  visibility: hidden;
}

.remember {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  cursor: pointer;
}

.forgot-password {
  color: #000000;
  font-weight: 600;
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

.btn-submit {
  width: 100%;
  background-color: #000000;
  color: #ffffff;
  border: none;
  padding: 18px;
  font-size: 1.1rem;
  font-weight: bold;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
}

.btn-submit::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.btn-submit:hover::after {
  transform: translateX(100%);
}

.btn-submit:hover {
  background-color: #1e293b;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.btn-submit:active {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
}

.login-footer {
  margin-top: 30px;
  text-align: center;
  color: #64748b;
  font-size: 0.95rem;
}

.login-footer a {
  color: #000000;
  font-weight: 700;
  text-decoration: none;
  margin-left: 5px;
}

.login-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 600px) {
  .login-container {
    max-width: 100%;
  }

  .login-header {
    min-height: auto;
  }

  .login-header h1 {
    font-size: 2.2rem;
  }

  .login-header p {
    min-height: auto;
  }
}
</style>
<template>
  <div class="login-page">
    <!-- Left Panel - Animated Characters -->
    <div class="left-panel">
      <div class="characters-wrapper">
        <div class="characters-scene" ref="sceneRef">
          <div class="character char-purple">
            <div class="eyes purple-eyes" style="left: 45px; top: 40px; gap: 28px">
              <div class="eyeball purple-eye-l" style="width: 18px; height: 18px">
                <div class="pupil purple-pupil-l" style="width: 7px; height: 7px"></div>
              </div>
              <div class="eyeball purple-eye-r" style="width: 18px; height: 18px">
                <div class="pupil purple-pupil-r" style="width: 7px; height: 7px"></div>
              </div>
            </div>
          </div>
          <div class="character char-black">
            <div class="eyes black-eyes" style="left: 26px; top: 32px; gap: 20px">
              <div class="eyeball black-eye-l" style="width: 16px; height: 16px">
                <div class="pupil black-pupil-l" style="width: 6px; height: 6px"></div>
              </div>
              <div class="eyeball black-eye-r" style="width: 16px; height: 16px">
                <div class="pupil black-pupil-r" style="width: 6px; height: 6px"></div>
              </div>
            </div>
          </div>
          <div class="character char-orange">
            <div class="eyes orange-eyes" style="left: 82px; top: 90px; gap: 28px">
              <div class="bare-pupil orange-pupil-l"></div>
              <div class="bare-pupil orange-pupil-r"></div>
            </div>
            <div class="orange-mouth" style="left: 90px; top: 120px"></div>
          </div>
          <div class="character char-yellow">
            <div class="eyes yellow-eyes" style="left: 52px; top: 40px; gap: 20px">
              <div class="bare-pupil yellow-pupil-l"></div>
              <div class="bare-pupil yellow-pupil-r"></div>
            </div>
            <div class="yellow-mouth" style="left: 40px; top: 88px"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Panel - Login Form -->
    <div class="right-panel">
      <div class="login-container">
        <div class="login-header">
          <h1>{{ isLoginMode ? '欢迎回来' : '创建新账号' }}</h1>
          <p>{{ isLoginMode ? '请输入您的账号密码进行登录' : '请填写手机号和密码完成注册' }}</p>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="input-group" v-if="isLoginMode">
            <label>账号</label>
            <input
              type="text" v-model="formData.account" placeholder="请输入账号" required
              @focus="onAccountFocus" @blur="onAccountBlur" @input="onAccountInput"
            />
          </div>

          <div class="input-group" v-if="!isLoginMode">
            <label>手机号</label>
            <input
              type="tel" v-model="formData.account" placeholder="请输入手机号" required
              @focus="onAccountFocus" @blur="onAccountBlur" @input="onAccountInput"
            />
          </div>

          <div class="input-group">
            <label>密码</label>
            <input
              type="password" v-model="formData.password" placeholder="请输入密码" required
              @focus="onPasswordFocus" @blur="onPasswordBlur" @input="onPasswordInput"
            />
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
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
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

// ==================== Character Animation ====================
const sceneRef = ref(null)
let mouseX = 0
let mouseY = 0
let isTyping = false
let isLookingAtEachOther = false
let isPurpleBlinking = false
let isBlackBlinking = false
let isPasswordFocused = false
let isLoginError = false
let typingTimer = null
let errorRecoverTimer = null
let isActive = false

function q(cls) {
  return sceneRef.value?.querySelector('.' + cls)
}

function onMouseMove(e) {
  mouseX = e.clientX
  mouseY = e.clientY
  if (!isTyping && !isLoginError) updateCharacters()
}

function onAccountFocus() { setTyping(true) }
function onAccountBlur() { setTyping(false) }
function onAccountInput() { updateCharacters() }
function onPasswordFocus() { isPasswordFocused = true; updateCharacters() }
function onPasswordBlur() { isPasswordFocused = false; updateCharacters() }
function onPasswordInput() { updateCharacters() }

function setTyping(typing) {
  isTyping = typing
  if (typing) {
    isLookingAtEachOther = true
    clearTimeout(typingTimer)
    typingTimer = setTimeout(() => {
      isLookingAtEachOther = false
      updateCharacters()
    }, 800)
  } else {
    isLookingAtEachOther = false
  }
  updateCharacters()
}

function scheduleBlinkPurple() {
  setTimeout(() => {
    if (!isActive) return
    isPurpleBlinking = true
    updateCharacters()
    setTimeout(() => {
      if (!isActive) return
      isPurpleBlinking = false
      updateCharacters()
      scheduleBlinkPurple()
    }, 150)
  }, Math.random() * 4000 + 3000)
}

function scheduleBlinkBlack() {
  setTimeout(() => {
    if (!isActive) return
    isBlackBlinking = true
    updateCharacters()
    setTimeout(() => {
      if (!isActive) return
      isBlackBlinking = false
      updateCharacters()
      scheduleBlinkBlack()
    }, 150)
  }, Math.random() * 4000 + 3000)
}

function calcPosition(el) {
  const rect = el.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 3
  const dx = mouseX - cx
  const dy = mouseY - cy
  const faceX = Math.max(-15, Math.min(15, dx / 20))
  const faceY = Math.max(-10, Math.min(10, dy / 30))
  const bodySkew = Math.max(-6, Math.min(6, -dx / 120))
  return { faceX, faceY, bodySkew }
}

function calcPupilOffset(el, maxDist) {
  const rect = el.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const dx = mouseX - cx
  const dy = mouseY - cy
  const dist = Math.min(Math.sqrt(dx * dx + dy * dy), maxDist)
  const angle = Math.atan2(dy, dx)
  return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist }
}

function updateCharacters() {
  if (!sceneRef.value) return

  const purple = q('char-purple')
  const black = q('char-black')
  const orange = q('char-orange')
  const yellow = q('char-yellow')
  if (!purple) return

  const purplePos = calcPosition(purple)
  const blackPos = calcPosition(black)
  const orangePos = calcPosition(orange)
  const yellowPos = calcPosition(yellow)

  const isLookingAway = isPasswordFocused

  // Purple body
  if (isLookingAway) {
    purple.style.transform = 'skewX(-14deg) translateX(-20px)'
    purple.style.height = '410px'
  } else if (isTyping) {
    purple.style.transform = `skewX(${(purplePos.bodySkew || 0) - 12}deg) translateX(40px)`
    purple.style.height = '410px'
  } else {
    purple.style.transform = `skewX(${purplePos.bodySkew}deg)`
    purple.style.height = '370px'
  }

  // Purple eyes
  const purpleEyes = q('purple-eyes')
  const purpleEyeL = q('purple-eye-l')
  const purpleEyeR = q('purple-eye-r')
  const purplePupilL = q('purple-pupil-l')
  const purplePupilR = q('purple-pupil-r')

  purpleEyeL.style.height = isPurpleBlinking ? '2px' : '18px'
  purpleEyeR.style.height = isPurpleBlinking ? '2px' : '18px'

  if (isLoginError) {
    purpleEyes.style.left = '30px'
    purpleEyes.style.top = '55px'
    purplePupilL.style.transform = 'translate(-3px, 4px)'
    purplePupilR.style.transform = 'translate(-3px, 4px)'
  } else if (isLookingAway) {
    purpleEyes.style.left = '20px'
    purpleEyes.style.top = '25px'
    purplePupilL.style.transform = 'translate(-5px, -5px)'
    purplePupilR.style.transform = 'translate(-5px, -5px)'
  } else if (isLookingAtEachOther) {
    purpleEyes.style.left = '55px'
    purpleEyes.style.top = '65px'
    purplePupilL.style.transform = 'translate(3px, 4px)'
    purplePupilR.style.transform = 'translate(3px, 4px)'
  } else {
    purpleEyes.style.left = 45 + purplePos.faceX + 'px'
    purpleEyes.style.top = 40 + purplePos.faceY + 'px'
    const po = calcPupilOffset(purpleEyeL, 5)
    purplePupilL.style.transform = `translate(${po.x}px, ${po.y}px)`
    purplePupilR.style.transform = `translate(${po.x}px, ${po.y}px)`
  }

  // Black body
  if (isLookingAway) {
    black.style.transform = 'skewX(12deg) translateX(-10px)'
  } else if (isLookingAtEachOther) {
    black.style.transform = `skewX(${(blackPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
  } else if (isTyping) {
    black.style.transform = `skewX(${(blackPos.bodySkew || 0) * 1.5}deg)`
  } else {
    black.style.transform = `skewX(${blackPos.bodySkew}deg)`
  }

  // Black eyes
  const blackEyes = q('black-eyes')
  const blackEyeL = q('black-eye-l')
  const blackEyeR = q('black-eye-r')
  const blackPupilL = q('black-pupil-l')
  const blackPupilR = q('black-pupil-r')

  blackEyeL.style.height = isBlackBlinking ? '2px' : '16px'
  blackEyeR.style.height = isBlackBlinking ? '2px' : '16px'

  if (isLoginError) {
    blackEyes.style.left = '15px'
    blackEyes.style.top = '40px'
    blackPupilL.style.transform = 'translate(-3px, 4px)'
    blackPupilR.style.transform = 'translate(-3px, 4px)'
  } else if (isLookingAway) {
    blackEyes.style.left = '10px'
    blackEyes.style.top = '20px'
    blackPupilL.style.transform = 'translate(-4px, -5px)'
    blackPupilR.style.transform = 'translate(-4px, -5px)'
  } else if (isLookingAtEachOther) {
    blackEyes.style.left = '32px'
    blackEyes.style.top = '12px'
    blackPupilL.style.transform = 'translate(0px, -4px)'
    blackPupilR.style.transform = 'translate(0px, -4px)'
  } else {
    blackEyes.style.left = 26 + blackPos.faceX + 'px'
    blackEyes.style.top = 32 + blackPos.faceY + 'px'
    const bo = calcPupilOffset(blackEyeL, 4)
    blackPupilL.style.transform = `translate(${bo.x}px, ${bo.y}px)`
    blackPupilR.style.transform = `translate(${bo.x}px, ${bo.y}px)`
  }

  // Orange body
  const orangeMouth = q('orange-mouth')
  if (isLoginError) {
    orangeMouth.style.left = 80 + orangePos.faceX + 'px'
    orangeMouth.style.top = '130px'
  }
  orange.style.transform = `skewX(${orangePos.bodySkew}deg)`

  // Orange eyes
  const orangeEyes = q('orange-eyes')
  const orangePupilL = q('orange-pupil-l')
  const orangePupilR = q('orange-pupil-r')

  if (isLoginError) {
    orangeEyes.style.left = '60px'
    orangeEyes.style.top = '95px'
    orangePupilL.style.transform = 'translate(-3px, 4px)'
    orangePupilR.style.transform = 'translate(-3px, 4px)'
  } else if (isLookingAway) {
    orangeEyes.style.left = '50px'
    orangeEyes.style.top = '75px'
    orangePupilL.style.transform = 'translate(-5px, -5px)'
    orangePupilR.style.transform = 'translate(-5px, -5px)'
  } else {
    orangeEyes.style.left = 82 + orangePos.faceX + 'px'
    orangeEyes.style.top = 90 + orangePos.faceY + 'px'
    const oo = calcPupilOffset(orangePupilL, 5)
    orangePupilL.style.transform = `translate(${oo.x}px, ${oo.y}px)`
    orangePupilR.style.transform = `translate(${oo.x}px, ${oo.y}px)`
  }

  // Yellow body
  yellow.style.transform = `skewX(${yellowPos.bodySkew}deg)`

  // Yellow eyes & mouth
  const yellowEyes = q('yellow-eyes')
  const yellowPupilL = q('yellow-pupil-l')
  const yellowPupilR = q('yellow-pupil-r')
  const yellowMouth = q('yellow-mouth')

  if (isLoginError) {
    yellowEyes.style.left = '35px'
    yellowEyes.style.top = '45px'
    yellowPupilL.style.transform = 'translate(-3px, 4px)'
    yellowPupilR.style.transform = 'translate(-3px, 4px)'
    yellowMouth.style.left = '30px'
    yellowMouth.style.top = '92px'
    yellowMouth.style.transform = 'rotate(-8deg)'
  } else if (isLookingAway) {
    yellowEyes.style.left = '20px'
    yellowEyes.style.top = '30px'
    yellowPupilL.style.transform = 'translate(-5px, -5px)'
    yellowPupilR.style.transform = 'translate(-5px, -5px)'
    yellowMouth.style.left = '15px'
    yellowMouth.style.top = '78px'
    yellowMouth.style.transform = 'rotate(0deg)'
  } else {
    yellowEyes.style.left = 52 + yellowPos.faceX + 'px'
    yellowEyes.style.top = 40 + yellowPos.faceY + 'px'
    const yo = calcPupilOffset(yellowPupilL, 5)
    yellowPupilL.style.transform = `translate(${yo.x}px, ${yo.y}px)`
    yellowPupilR.style.transform = `translate(${yo.x}px, ${yo.y}px)`
    yellowMouth.style.left = 40 + yellowPos.faceX + 'px'
    yellowMouth.style.top = 88 + yellowPos.faceY + 'px'
    yellowMouth.style.transform = 'rotate(0deg)'
  }
}

// Error animation
const shakeClasses = [
  'purple-eyes', 'black-eyes', 'orange-eyes', 'yellow-eyes',
  'yellow-mouth', 'orange-mouth'
]

function triggerLoginError() {
  if (errorRecoverTimer) {
    clearTimeout(errorRecoverTimer)
    errorRecoverTimer = null
  }

  const shakeEls = shakeClasses.map(cls => q(cls)).filter(Boolean)
  shakeEls.forEach(el => el.classList.remove('shake-head'))
  void document.body.offsetHeight

  isLoginError = true
  isPasswordFocused = false
  updateCharacters()

  q('orange-mouth')?.classList.add('visible')

  setTimeout(() => {
    shakeEls.forEach(el => el.classList.add('shake-head'))
  }, 350)

  errorRecoverTimer = setTimeout(() => {
    isLoginError = false
    errorRecoverTimer = null
    q('orange-mouth')?.classList.remove('visible')
    shakeEls.forEach(el => el.classList.remove('shake-head'))
    updateCharacters()
  }, 2500)
}

onMounted(() => {
  isActive = true
  document.addEventListener('mousemove', onMouseMove)
  scheduleBlinkPurple()
  scheduleBlinkBlack()
  updateCharacters()
})

onUnmounted(() => {
  isActive = false
  document.removeEventListener('mousemove', onMouseMove)
  clearTimeout(typingTimer)
  clearTimeout(errorRecoverTimer)
})

// ==================== Form Logic ====================
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
    triggerLoginError()
    notifyErrorOnce(error)
  }
}
</script>

<style scoped>
/* ==================== Layout ==================== */
.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background-color: #ffffff;
}

.left-panel {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  overflow: hidden;
}

.left-panel::after {
  content: "";
  position: absolute;
  top: 20%;
  right: 15%;
  width: 260px;
  height: 260px;
  background: rgba(180, 170, 200, 0.25);
  border-radius: 50%;
  filter: blur(80px);
}

.left-panel::before {
  content: "";
  position: absolute;
  bottom: 15%;
  left: 10%;
  width: 350px;
  height: 350px;
  background: rgba(200, 195, 210, 0.2);
  border-radius: 50%;
  filter: blur(100px);
}

.right-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100px 20px 40px;
}

/* ==================== Characters ==================== */
.characters-wrapper {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  height: 420px;
}

.characters-scene {
  position: relative;
  width: 480px;
  height: 360px;
}

.character {
  position: absolute;
  bottom: 0;
  transition: all 0.7s ease-in-out;
  transform-origin: bottom center;
}

.char-purple {
  left: 60px;
  width: 170px;
  height: 370px;
  background: #6c3ff5;
  border-radius: 10px 10px 0 0;
  z-index: 1;
}

.char-black {
  left: 220px;
  width: 115px;
  height: 290px;
  background: #2d2d2d;
  border-radius: 8px 8px 0 0;
  z-index: 2;
}

.char-orange {
  left: 0;
  width: 230px;
  height: 190px;
  background: #ff9b6b;
  border-radius: 115px 115px 0 0;
  z-index: 3;
}

.char-yellow {
  left: 290px;
  width: 135px;
  height: 215px;
  background: #e8d754;
  border-radius: 68px 68px 0 0;
  z-index: 4;
}

.eyes {
  position: absolute;
  display: flex;
  transition: all 0.7s ease-in-out;
}

.eyeball {
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: height 0.15s ease;
  overflow: hidden;
}

.pupil {
  border-radius: 50%;
  background: #2d2d2d;
  transition: transform 0.1s ease-out;
}

.bare-pupil {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #2d2d2d;
  transition: transform 0.7s ease-in-out;
}

.yellow-mouth {
  position: absolute;
  width: 50px;
  height: 4px;
  background: #2d2d2d;
  border-radius: 2px;
  transition: all 0.7s ease-in-out;
}

.orange-mouth {
  position: absolute;
  width: 28px;
  height: 14px;
  border: 3px solid #2d2d2d;
  border-top: none;
  border-radius: 0 0 14px 14px;
  opacity: 0;
  transition: all 0.7s ease-in-out;
}

.orange-mouth.visible {
  opacity: 1;
}

@keyframes shakeHead {
  0%, 100% { translate: 0 0; }
  10% { translate: -9px 0; }
  20% { translate: 7px 0; }
  30% { translate: -6px 0; }
  40% { translate: 5px 0; }
  50% { translate: -4px 0; }
  60% { translate: 3px 0; }
  70% { translate: -2px 0; }
  80% { translate: 1px 0; }
  90% { translate: -0.5px 0; }
}

.eyes.shake-head,
.yellow-mouth.shake-head,
.orange-mouth.shake-head {
  animation: shakeHead 0.8s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

/* ==================== Form ==================== */
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

/* ==================== Responsive ==================== */
@media (max-width: 900px) {
  .login-page {
    grid-template-columns: 1fr;
  }

  .left-panel {
    display: none;
  }

  .right-panel {
    padding: 100px 20px 40px;
  }
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

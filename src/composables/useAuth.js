import { computed, ref } from 'vue'
import { loginAPI, registerAPI } from '../api/user'
import { STORAGE_KEYS } from '../constants/storage-keys'

const token = ref(localStorage.getItem(STORAGE_KEYS.token) || '')

const setToken = (nextToken) => {
  token.value = nextToken || ''

  if (nextToken) {
    localStorage.setItem(STORAGE_KEYS.token, nextToken)
    return
  }

  localStorage.removeItem(STORAGE_KEYS.token)
}

export const clearAuth = () => {
  setToken('')
}

export const useAuth = () => {
  const isLoggedIn = computed(() => Boolean(token.value))

  const register = async ({ account, password }) => {
    return registerAPI({ account, password })
  }

  const login = async ({ account, password }) => {
    const loginData = await loginAPI({ account, password })
    const sessionToken = loginData?.token

    if (!sessionToken) {
      throw new Error('登录接口未返回 token')
    }

    setToken(sessionToken)

    return loginData
  }

  const logout = () => {
    clearAuth()
  }

  return {
    token,
    isLoggedIn,
    login,
    register,
    logout
  }
}

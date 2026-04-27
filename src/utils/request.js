// src/utils/request.js
import axios from 'axios'
import JSONBig from 'json-bigint'
import { HTTP_CONFIG, API_SUCCESS_CODES } from '../config/http'
import { STORAGE_KEYS } from '../constants/storage-keys'
import { notifyError } from './notify'
import { createHandledError, extractServerMessage } from './error-handler'
import { clearAuth } from '../composables/useAuth'

const JSONBigStr = JSONBig({ storeAsString: true })

const request = axios.create({
  baseURL: HTTP_CONFIG.baseURL,
  timeout: HTTP_CONFIG.timeout,
  transformResponse: [(data) => {
    try {
      return JSONBigStr.parse(data)
    } catch {
      return data
    }
  }]
})

const AUTH_REQUIRED_KEYWORDS = ['请先登录', '请先登陆', '未登录', '登录失效', 'token缺失', 'token过期']

const isAuthRequiredMessage = (message) => {
  if (!message) return false
  return AUTH_REQUIRED_KEYWORDS.some((keyword) => message.includes(keyword))
}

request.interceptors.request.use(
  config => {
    const token = localStorage.getItem(STORAGE_KEYS.token)
    if (token) {
      config.headers['token'] = token
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  response => {
    const payload = response.data
    const code = Number(payload?.code)
    const message = extractServerMessage(payload) || '操作失败'

    if (!API_SUCCESS_CODES.includes(code)) {
      if (isAuthRequiredMessage(message)) {
        clearAuth()
        notifyError(message || '请先登录')
        return Promise.reject(createHandledError(message || '请先登录', payload))
      }

      notifyError(message)
      return Promise.reject(createHandledError(message, payload))
    }

    return payload?.data
  },
  error => {
    const serverMessage = extractServerMessage(error?.response?.data)
    let message = serverMessage

    if (error.response) {
      const status = error.response.status
      if (status === 401) {
        message = message || '请先登录'
        notifyError(message)
        clearAuth()
      } else if (status === 404) {
        notifyError(message || '接口不存在，请检查网关或请求路径！')
        message = message || '接口不存在，请检查网关或请求路径！'
      } else if (status >= 500) {
        notifyError(message || '服务器开了个小差，请稍后再试！')
        message = message || '服务器开了个小差，请稍后再试！'
      } else {
        notifyError(message || '请求失败，请稍后重试！')
        message = message || '请求失败，请稍后重试！'
      }
    } else {
      notifyError(message || '网络连接异常，请检查您的网络！')
      message = message || '网络连接异常，请检查您的网络！'
    }

    return Promise.reject(createHandledError(message, error))
  }
)

export default request
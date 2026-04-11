import axios from 'axios'
import { API_PATHS } from '../constants/api-paths'
import { HTTP_CONFIG } from '../config/http'
import { STORAGE_KEYS } from '../constants/storage-keys'

export const AI_CHAT_TYPES = {
  chat: 'chat',
  service: 'service',
  pdf: 'pdf'
}

const AI_ENDPOINT_BY_TYPE = {
  [AI_CHAT_TYPES.chat]: API_PATHS.ai.chat,
  [AI_CHAT_TYPES.service]: API_PATHS.ai.service,
  [AI_CHAT_TYPES.pdf]: API_PATHS.ai.pdf
}

const normalizeType = (type) => {
  const value = String(type || '').trim().toLowerCase()
  if (Object.values(AI_CHAT_TYPES).includes(value)) return value
  return AI_CHAT_TYPES.chat
}

const aiRequest = (options = {}) => {
  const token = localStorage.getItem(STORAGE_KEYS.token)
  return axios({
    baseURL: HTTP_CONFIG.baseURL,
    timeout: HTTP_CONFIG.aiTimeout,
    headers: token ? { token } : undefined,
    ...options
  })
}

const parseListResponse = (response) => {
  return Array.isArray(response?.data) ? response.data : []
}

const parseObjectResponse = (response) => {
  return response?.data && typeof response.data === 'object' ? response.data : null
}

const normalizeSessionVO = (row, fallbackType = AI_CHAT_TYPES.chat) => {
  const chatId = String(row?.chatId || '').trim()
  const rawType = String(row?.type || fallbackType).trim().toLowerCase()
  const type = Object.values(AI_CHAT_TYPES).includes(rawType) ? rawType : AI_CHAT_TYPES.chat
  const sessionTitle = String(row?.sessionTitle || '').trim()

  return {
    chatId,
    type,
    sessionTitle
  }
}

export const createAiSessionAPI = async (type) => {
  const normalizedType = normalizeType(type)
  const response = await aiRequest({
    url: API_PATHS.ai.createChat,
    method: 'get',
    params: { type: normalizedType }
  })

  const payload = parseObjectResponse(response)
  if (!payload) {
    throw new Error('createChat response is not SessionVO')
  }

  return normalizeSessionVO(payload, normalizedType)
}

export const getAiSessionsAPI = async () => {
  const response = await aiRequest({
    url: API_PATHS.ai.history,
    method: 'get'
  })
  return parseListResponse(response)
    .map((item) => normalizeSessionVO(item))
    .filter((item) => item.chatId)
}

export const getAiSessionDetailAPI = async (chatId) => {
  const response = await aiRequest({
    url: `${API_PATHS.ai.historyDetail}/${encodeURIComponent(chatId)}`,
    method: 'get'
  })
  return parseListResponse(response)
}

export const deleteAiSessionAPI = async (chatId) => {
  await aiRequest({
    url: `${API_PATHS.ai.historyDelete}/${encodeURIComponent(chatId)}`,
    method: 'get'
  })
}

export const updateAiSessionTitleAPI = async ({ chatId, sessionTitle }) => {
  await aiRequest({
    url: API_PATHS.ai.historyTitle,
    method: 'post',
    params: { chatId, sessionTitle }
  })
}

export const sendAiPromptAPI = async ({ type, prompt, chatId }) => {
  const normalizedType = normalizeType(type)
  const endpoint = AI_ENDPOINT_BY_TYPE[normalizedType] || API_PATHS.ai.chat

  const response = await aiRequest({
    url: endpoint,
    method: 'post',
    params: { prompt, chatId }
  })

  return parseListResponse(response)
}

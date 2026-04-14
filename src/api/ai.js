import request from '../utils/request'
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
  return request({
    timeout: HTTP_CONFIG.aiTimeout,
    ...options
  })
}

const aiRawRequest = (options = {}) => {
  const token = localStorage.getItem(STORAGE_KEYS.token)
  return axios({
    baseURL: HTTP_CONFIG.baseURL,
    timeout: HTTP_CONFIG.aiTimeout,
    headers: token ? { token } : undefined,
    ...options
  })
}

const parseListResponse = (data) => {
  return Array.isArray(data) ? data : []
}

const parseObjectResponse = (data) => {
  return data && typeof data === 'object' ? data : null
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
  const data = await aiRequest({
    url: API_PATHS.ai.createChat,
    method: 'get',
    params: { type: normalizedType }
  })

  const payload = parseObjectResponse(data)
  if (!payload) {
    throw new Error('createChat response is not SessionVO')
  }

  return normalizeSessionVO(payload, normalizedType)
}

export const getAiSessionsAPI = async () => {
  const data = await aiRequest({
    url: API_PATHS.ai.history,
    method: 'get'
  })
  return parseListResponse(data)
    .map((item) => normalizeSessionVO(item))
    .filter((item) => item.chatId)
}

export const getAiSessionDetailAPI = async (chatId) => {
  const data = await aiRequest({
    url: `${API_PATHS.ai.historyDetail}/${encodeURIComponent(chatId)}`,
    method: 'get'
  })
  return parseListResponse(data)
}

export const deleteAiSessionAPI = async (chatId) => {
  await aiRawRequest({
    url: `${API_PATHS.ai.historyDelete}/${encodeURIComponent(chatId)}`,
    method: 'get'
  })
}

export const updateAiSessionTitleAPI = async ({ chatId, sessionTitle }) => {
  await aiRawRequest({
    url: API_PATHS.ai.historyTitle,
    method: 'post',
    params: { chatId, sessionTitle }
  })
}

export const sendAiPromptAPI = async ({ type, prompt, chatId }) => {
  const normalizedType = normalizeType(type)
  const endpoint = AI_ENDPOINT_BY_TYPE[normalizedType] || API_PATHS.ai.chat

  const data = await aiRequest({
    url: endpoint,
    method: 'post',
    params: { prompt, chatId }
  })

  return parseListResponse(data)
}

export const uploadAiPdfAPI = async ({ chatId, file }) => {
  const formData = new FormData()
  formData.append('file', file)

  await aiRequest({
    url: `${API_PATHS.ai.pdfUpload}/${encodeURIComponent(chatId)}`,
    method: 'post',
    data: formData
  })
}

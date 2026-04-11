const parseNumber = (value, fallback) => {
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

const parseSuccessCodes = (rawCodes) => {
  return rawCodes
    .split(',')
    .map((code) => Number(code.trim()))
    .filter((code) => Number.isFinite(code))
}

export const HTTP_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: parseNumber(import.meta.env.VITE_HTTP_TIMEOUT, 10000),
  aiTimeout: parseNumber(import.meta.env.VITE_AI_CHAT_TIMEOUT, 120000)
}

export const API_SUCCESS_CODES = parseSuccessCodes(import.meta.env.VITE_API_SUCCESS_CODES || '200,1')
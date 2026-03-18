import { notifyError } from './notify'

const DEFAULT_ERROR_MESSAGE = '操作失败，请稍后重试'

export const extractServerMessage = (payload) => {
  return payload?.message || payload?.msg || payload?.error || ''
}

export const createHandledError = (message, originalError) => {
  const error = new Error(message || DEFAULT_ERROR_MESSAGE)
  error.alreadyNotified = true
  error.originalError = originalError
  return error
}

export const getErrorMessage = (error, fallbackMessage = DEFAULT_ERROR_MESSAGE) => {
  if (!error) return fallbackMessage
  if (typeof error === 'string') return error

  return (
    error?.message ||
    extractServerMessage(error?.response?.data) ||
    fallbackMessage
  )
}

export const notifyErrorOnce = (error, fallbackMessage = DEFAULT_ERROR_MESSAGE) => {
  const message = getErrorMessage(error, fallbackMessage)

  if (!error?.alreadyNotified) {
    notifyError(message)
  }

  return message
}

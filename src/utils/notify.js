import { reactive } from 'vue'

let seed = 0

export const notifications = reactive([])

const DEFAULT_DURATION = 2600

export const notify = ({ type = 'info', message = '', duration = DEFAULT_DURATION }) => {
  if (!message) return

  const id = ++seed
  notifications.push({ id, type, message })

  window.setTimeout(() => {
    const index = notifications.findIndex((item) => item.id === id)
    if (index !== -1) {
      notifications.splice(index, 1)
    }
  }, duration)
}

export const notifySuccess = (message, duration) => notify({ type: 'success', message, duration })
export const notifyError = (message, duration) => notify({ type: 'error', message, duration })
export const notifyInfo = (message, duration) => notify({ type: 'info', message, duration })
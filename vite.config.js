import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173, // 你本地前端跑的端口
    open: true, // 启动时自动打开浏览器
proxy: {
      '/api': {
        target: 'http://localhost:8080', // 你的网关地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '') // 必须有这一行，把 /api 抹掉
      }
    }
  }
})

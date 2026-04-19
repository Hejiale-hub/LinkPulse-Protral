import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // 引入我们之前写的路由配置
import './assets/iconfont/iconfont.css'
import './assets/iconfont/iconfont.js'

const app = createApp(App)

// 关键步骤：告诉 Vue 使用路由插件！这样它就能认识 router-link 和 router-view 了
app.use(router) 

app.mount('#app')
import { createApp } from 'vue'
import App from './App.vue'

console.log('Starting application...')

const app = createApp(App)

// 添加错误处理
app.config.errorHandler = (err) => {
  console.error('Global error:', err)
}

app.mount('#app')

console.log('Application mounted')
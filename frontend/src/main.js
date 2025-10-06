import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // ✅ Make sure this path is correct

const app = createApp(App)

app.use(router)  // ✅ This is what enables <router-view>
app.mount('#app')

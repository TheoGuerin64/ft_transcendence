import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import Welcome from './components/Welcome.vue'
import Game from './components/Game.vue'

const routes = [
    { path: '/', component: Welcome },
    { path: '/Game', component: Game },
  ]
  
const router = createRouter({
    history: createWebHashHistory(),
    routes, 
})

const app = createApp(App)

app.use(router)
app.mount("#app")

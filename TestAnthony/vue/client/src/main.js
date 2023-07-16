import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import Welcome from './components/Welcome.vue'
import Game from './components/Game.vue'
import API from './components/API.vue'

const routes = [
    { path: '/', component: Welcome },
    { path: '/Game', component: Game },
    { path: '/API', component: API },
  ]

const router = createRouter({
    history: createWebHashHistory(),
    routes, 
})

const app = createApp(App)

app.use(router)
app.mount("#app")

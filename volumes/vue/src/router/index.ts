import HomeView from '../views/HomeView.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { Socket } from 'socket.io-client'
import { User } from '../types'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      props: { socket: Socket, user: null as User | null }
    }
  ]
})

export default router

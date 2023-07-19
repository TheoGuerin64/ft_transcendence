import { createRouter, createWebHistory } from 'vue-router'
import { Socket } from 'socket.io-client'
import HomeView from '../views/HomeView.vue'
import AuthView from '../views/AuthView.vue'
import { User } from '../types'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      props: { socket: Socket, user: null as User | null }
    },
    {
      path: '/auth',
      name: 'auth',
      component: AuthView,
      props: { socket: Socket, user: null as User | null }
    }
  ]
})

export default router

import GameView from '../views/GameView.vue'
import HomeView from '../views/HomeView.vue'
import MatchHistoryView from '../views/MatchHistoryView.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { store } from '../store'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/Game',
      name: 'game',
      component: GameView
    },
    {
      path: '/MatchHistory',
      name: 'match history',
      component: MatchHistoryView
    }
  ]
})

export default router

import { createRouter, createWebHistory } from 'vue-router'
import CallBackView from '../views/CallbackView.vue'
import HomeView from '../views/HomeView.vue'
import PathNotFoundView from '../views/PathNotFoundView.vue'
import ProfileSearchView from '../views/ProfileSearchView.vue'
import ProfileView from '../views/ProfileView.vue'
import PublicProfileView from '../views/PublicProfileView.vue'
import { isAuthenticatedGuard } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/callback',
      name: 'callback',
      component: CallBackView
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      beforeEnter: isAuthenticatedGuard
    },
    {
      path: '/profile/search',
      name: 'search-profile',
      component: ProfileSearchView,
      beforeEnter: isAuthenticatedGuard
    },
    {
      path: '/profile/public/:login',
      name: 'public-profile',
      component: PublicProfileView,
      beforeEnter: isAuthenticatedGuard
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'page-not-found',
      component: PathNotFoundView
    }
  ]
})

export default router

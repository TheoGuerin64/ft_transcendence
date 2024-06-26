<script setup lang="ts">
import axios from 'axios'
import { RouterLink } from 'vue-router'
import { socket, socketConnect } from '../socket'
import { useStore } from '../store'
import UserAvatar from './UserAvatar.vue'
</script>

<script lang="ts">
/**
 * Navigation menu component
 */
export default {
  data() {
    return {
      store: useStore
    }
  },

  methods: {
    /**
     * Toggle the navbar menu
     */
    toggleMenu(): void {
      const burger = document.querySelector('.navbar-burger')
      const menu = document.querySelector('.navbar-menu')
      burger?.classList.toggle('is-active')
      menu?.classList.toggle('is-active')
    },

    /**
     * Sign in to the application using the OAuth2 provider
     */
    signIn(): void {
      this.store.setConnecting(true)
      window.location.href = 'http://127.0.0.1:3000/auth/authorize'
    },

    /**
     * Sign out from the application and clear the user data
     */
    async signOut(): Promise<void> {
      this.$router.push('/')
      await axios.get('http://127.0.0.1:3000/auth/sign-out', {
        withCredentials: true
      })
      this.store.setUser(null)
      socket.disconnect()
    },

    /**
     * Sign in to the application with fake user
     */
    async fake(): Promise<void> {
      this.store.setConnecting(true)

      await axios.get('http://127.0.0.1:3000/auth/fake', {
        withCredentials: true
      })
      socketConnect()

      // get user
      const user = await axios.get('http://127.0.0.1:3000/user', {
        withCredentials: true
      })
      this.store.setUser(user.data)

      // redirect to home
      this.store.setConnecting(false)
      await this.$router.push('/')
    }
  }
}
</script>

<template>
  <nav class="navbar is-dark">
    <div class="navbar-brand">
      <button class="navbar-burger" @click="toggleMenu">
        <!-- Bulma navbar burger -->
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
    <div class="navbar-menu">
      <div class="navbar-start">
        <RouterLink to="/" class="navbar-item">Home</RouterLink>
        <RouterLink to="/chat" class="navbar-item">Chat</RouterLink>
        <RouterLink to="/game" class="navbar-item">Game</RouterLink>
        <RouterLink to="/match-history" class="navbar-item">Match History</RouterLink>
      </div>
      <div class="navbar-end">
        <a v-if="!store.user && !store.isConnecting" class="navbar-item" @click="fake"
          >Sign In as Fake</a
        >
        <a v-if="!store.user && !store.isConnecting" class="navbar-item" @click="signIn">Sign In</a>
        <a v-if="store.isConnecting" class="navbar-item connecting dots-animation">Connecting</a>
        <a v-if="store.user && !store.isConnecting" class="navbar-item" @click="signOut"
          >Sign Out</a
        >
        <RouterLink
          v-if="store.user && !store.isConnecting"
          to="/profile"
          class="navbar-item is-flex is-flex-direction-row"
          style="padding: 0"
        >
          <span class="px-2">{{ store.user.name }}</span>
          <UserAvatar :image="store.user.avatar" :size="52" />
        </RouterLink>
      </div>
    </div>
  </nav>
</template>

<style>
@media screen and (min-width: 1023px) {
  .router-link-active {
    background-color: #292929;
  }
}

@media screen and (max-width: 1023px) {
  .router-link-active {
    background-color: #fafafa;
    color: #485fc7 !important;
  }
}

.connecting {
  pointer-events: none;
  cursor: default;
}

.connecting::after {
  width: 0.75em;
}

.connecting::hover {
  background-color: transparent;
}
</style>

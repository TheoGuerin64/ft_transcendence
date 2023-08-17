<script setup lang="ts">
import axios from 'axios'
import { RouterLink } from 'vue-router'
import { useStore } from '../store'
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
      </div>
      <div class="navbar-end">
        <a v-if="!store.user && !store.isConnecting" class="navbar-item" @click="signIn">Sign In</a>
        <a v-if="store.isConnecting" class="navbar-item connecting">Connecting</a>
        <a v-if="store.user && !store.isConnecting" class="navbar-item" @click="signOut"
          >Sign Out</a
        >
        <RouterLink v-if="store.user && !store.isConnecting" to="/profile" class="navbar-item">{{
          store.user.name
        }}</RouterLink>
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

@keyframes dots {
  0% {
    content: '';
  }
  25% {
    content: '.';
  }
  50% {
    content: '..';
  }
  75% {
    content: '...';
  }
  100% {
    content: '';
  }
}

.connecting::after {
  content: '';
  width: 0.75em;
  animation: dots 1.2s infinite;
}

.connecting::hover {
  background-color: transparent;
}
</style>

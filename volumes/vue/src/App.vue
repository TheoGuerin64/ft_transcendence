<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { io } from 'socket.io-client'
import { User, type UserResponse } from './types'
import LogPanel from './components/AuthPanel.vue'
</script>

<script lang="ts">
export default {
  data() {
    return {
      socket: io('http://127.0.0.1:3000')!,
      user: undefined as User | undefined
    }
  },

  mounted() {
    this.socket.on('auth_success', (data: UserResponse) => {
      this.user = new User(data.login, data.name, data.avatar)
    })
  },

  unmounted() {
    this.socket!.close()
  },
  methods: {
    updateAvatar(fileB64: string) {
      this.user!.avatar = fileB64
    }
  }
}
</script>

<template>
  <header>
    <nav>
      <RouterLink to="/">Home</RouterLink>
    </nav>
    <LogPanel :user="user" />
  </header>

  <RouterView :socket="socket" :user="user" @updateAvatar="updateAvatar"/>
</template>

<style>
header {
  color: white;
  background-color: cornflowerblue;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

header a:hover {
  color: lightgray;
}

nav {
  display: flex;
  gap: 1rem;
}
</style>

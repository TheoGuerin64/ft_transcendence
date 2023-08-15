<script setup lang="ts">
import axios from 'axios'
import { RouterView } from 'vue-router'
import { socketConnect } from './socket'
import { useStore, type User } from './store'
import FloatingProfile from './components/FloatingProfile.vue'
</script>

<script lang="ts">
export default {
  data() {
    return {
      store: useStore
    }
  },

  methods: {
    /**
     * Get the current user from the backend.
     */
    async getUser(): Promise<User | null> {
      try {
        const response = await axios.get('http://127.0.0.1:3000/user')
        return response.data
      } catch (error: any) {
        if (axios.isAxiosError(error) && error.response && error.response.status == 401) {
          return null
        } else {
          throw error
        }
      }
    }
  },

  async mounted() {
    // Get the current user when the app is mounted and the store is empty.
    if (this.store.user === undefined) {
      const user = await this.getUser()
      this.store.setUser(user)
    }

    // Connect to the websocket server if the user is logged in.
    if (this.store.user !== null) {
      socketConnect()
    }
  }
}
</script>

<template>
  <div v-if="store.user !== undefined">
    <FloatingProfile />
    <notifications position="bottom right" />
    <RouterView />
  </div>
</template>

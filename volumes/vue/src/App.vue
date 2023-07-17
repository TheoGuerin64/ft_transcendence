<script setup lang="ts">
import { RouterView } from 'vue-router'
import { io, Socket } from 'socket.io-client'
</script>

<script lang="ts">
export default {
  data() {
    return {
      socket: null as Socket | null
    }
  },

  mounted() {
    this.socket = io('http://localhost:3000')
  },

  unmounted() {
    this.socket!.close()
  }
}
</script>

<template>
  <RouterView :socket="socket" />
</template>

<style scoped>
</style>

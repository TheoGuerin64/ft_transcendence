<script setup lang="ts">
import PongGame from '../components/PongGame.vue'
import { Socket } from 'socket.io-client'
const props = defineProps({
  socket: {
    type: Socket,
    required: true
  }
})
</script>

<template>
  <main>
    <PongGame :socket="socket"/>
  </main>
</template>

<style scoped>
main {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
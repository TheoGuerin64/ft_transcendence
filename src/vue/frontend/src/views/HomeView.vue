<script setup lang="ts">
import { socket } from '../socket'
</script>

<script lang="ts">
export default {
  methods: {
    emitTest(): void {
      socket.emit('message', 'test')
      this.$notify({
        text: 'emit message test',
        type: 'success'
      })
    }
  }
}
</script>

<template>
  <main>
    <div class="mt-3 ml-4">
      <h1 class="title is-size-1-desktop has-text-dark">Home</h1>
      <button class="button is-primary" @click="emitTest">Emit test</button>
    </div>
  </main>
</template>

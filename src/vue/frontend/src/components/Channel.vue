<script setup lang="ts">
import { socket } from '@/socket'
</script>

<script lang="ts">
export default {
  name: 'Channel',
  props: {
    name: String,
    isPublic: Boolean,
    isProtected: Boolean
  },
  data() {
    return {}
  },
  methods: {
    joinChannel(): void {
      socket.emit('join-channel', this.name)
      this.$router.push('/chat/' + this.name)
    }
  }
}
</script>

<template>
  <div id="channels" class="box">
    <div class="content">{{ name }}</div>
    <div class="button" @click="joinChannel">Join Channel</div>
  </div>
</template>

<style></style>

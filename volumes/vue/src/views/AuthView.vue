<script setup lang="ts">
import { Socket } from 'socket.io-client'
import { User } from '../types'
import router from '@/router'
</script>

<script lang="ts">
export default {
  props: {
    socket: {
      type: Socket,
      required: true
    },
    user: {
      type: User,
      default: null
    }
  },

  data() {
    return {
      code: null as string | null
    }
  },

  mounted() {
    const url = new URL(window.location.href)
    this.code = url.searchParams.get('code')
    if (this.code) {
      this.socket.emit('auth_connect', this.code)
      this.code = null
      router.push('/')
    }
  }
}
</script>

<template>
  <div class="AuthPanel">
    <h1>Log in</h1>
    <a v-if="!code && !user" href="http://127.0.0.1:3000/auth/login">Connect</a>
  </div>
</template>

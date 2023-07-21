<script setup lang="ts">
import { User } from '../types'
</script>

<script lang="ts">
export default {
  props: {
    user: {
      type: User,
      default: null
    }
  },
  computed: {
    link() {
      return this.user ? 'http://127.0.0.1:3000/auth/logout' : 'http://127.0.0.1:3000/auth/login'
    }
  }
}
</script>

<template>
  <div class="AuthPanel">
    <span v-if="user">{{ user.name }}</span>
    <a :href="link">Connect</a>
  </div>
</template>

<style scoped>
.AuthPanel {
  display: flex;
  gap: 1rem;
}
</style>

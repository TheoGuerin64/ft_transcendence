<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { User } from '../types'
</script>

<script lang="ts">
export default {
  props: {
    user: {
      type: User,
      default: null
    }
  }
}
</script>

<template>
  <div class="AuthPanel">
    <span v-if="user">{{ user.name }}</span>
    <RouterLink to="/auth">{{ user ? 'Logout' : 'Login' }}</RouterLink>
  </div>
</template>

<style scoped>
.AuthPanel {
  display: flex;
  gap: 1rem;
}
</style>

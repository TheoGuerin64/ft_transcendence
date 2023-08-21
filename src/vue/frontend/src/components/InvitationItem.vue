<script setup lang="ts">
import UserAvatar from './UserAvatar.vue'
</script>

<script lang="ts">
export default {
  props: {
    invitation: {
      type: Object,
      required: true
    }
  }
}
</script>

<template>
  <div>
    <UserAvatar />
  </div>
</template>

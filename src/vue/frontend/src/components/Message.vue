<script setup lang="ts">
import axios from 'axios'
import { RouterLink } from 'vue-router'
import { useStore } from '../store'
import UserAvatar from './UserAvatar.vue'
</script>

<script lang="ts">
export default {
  name: 'Message',
  props: {
    avatar: String,
    login: String,
    username: String,
    content: String
  },
  data() {
    return {}
  }
}
</script>

<template>
  <div id="messages" class="box is-large columns mb-2 mt-2 is-flex-grow-1">
    <div class="column is-narrow is-flex is-flex-direction-column is-justify-content-center">
      <UserAvatar :image="avatar" :size="40" class="round-image" />
    </div>
    <div
      class="column is-flex is-flex-direction-column is-justify-content-center is-flex-wrap-wrap"
    >
      <p class="has-text-left is-size-5 break-word">{{ content }}</p>
    </div>
  </div>
</template>

<style>
.round-image {
  border-radius: 50%;
}

.break-word {
  overflow-wrap: break-word;
  word-wrap: break-all;
}

#messages {
  height: 60px;
}
</style>

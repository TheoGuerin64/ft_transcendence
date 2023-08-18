<script setup lang="ts">
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
    return {
      profile: 'http://127.0.0.1:8080/profile/public/' + this.login
    }
  }
}
</script>

<template>
  <div id="messages" class="box is-large columns mb-2 mt-2 is-flex-grow-1">
    <div class="column is-narrow is-flex is-flex-direction-column is-justify-content-center">
      <a :href="profile"><UserAvatar :image="avatar" :size="40" class="round-image" /></a>
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

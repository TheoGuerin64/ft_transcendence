<script setup lang="ts">
import { store } from '../store'
import UserAvatar from '@/components/UserAvatar.vue'
</script>

<script lang="ts">
export default {
  data() {
    return {
      store
    }
  },
  props: {
    playerOneLogin: String,
    playerOneScore: Number,
    playerOneAvatar: String,
    playerTwoLogin: String,
    playerTwoScore: Number,
    playerTwoAvatar: String,
    win: Boolean
  }
}
</script>
<template>
  <div class="box is-flex is-justify-content-space-between">
    <div>
      <UserAvatar :size="256" :image="playerOneAvatar" />
      {{ playerOneLogin }} {{ playerOneScore }}
    </div>
    <div>
      <UserAvatar :size="256" :image="playerTwoAvatar" />
      {{ playerTwoLogin }} {{ playerTwoScore }}
    </div>
  </div>
</template>
<style>
@import 'https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css';
</style>

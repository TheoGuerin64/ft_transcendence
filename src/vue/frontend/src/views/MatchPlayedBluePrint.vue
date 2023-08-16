<script setup lang="ts">
import { store } from '../store'
import UserAvatar from '@/components/UserAvatar.vue'
</script>

<script lang="ts">
export default {
  data() {
    return {
      store,
      boxClass:
        'box column is-flex is-three-fifths is-offset-one-fifth is-justify-content-space-between has-background-danger"'
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
  },
  mounted() {
    if (this.userWon() === true) {
      this.boxClass += ' has-background-success'
    } else {
      this.boxClass += ' has-background-danger'
    }
  },
  methods: {
    userWon(): boolean {
      if (
        (this.store.user?.name === this.playerOneLogin && this.playerOneScore === 5) ||
        (this.store.user?.name === this.playerTwoLogin && this.playerTwoScore === 5)
      ) {
        return true
      } else {
        return false
      }
    }
  }
}
</script>
<template>
  <div :class="boxClass">
    <div>
      <UserAvatar :size="128" :image="playerOneAvatar" />
      <div class="is-size-4 has-text-centered">
        {{ playerOneLogin }}
      </div>
    </div>
    <div class="is-size-2 pt-5 mt-5">
      <p>{{ playerOneScore }} - {{ playerTwoScore }}</p>
    </div>
    <div>
      <UserAvatar :size="128" :image="playerTwoAvatar" />
      <div class="is-size-4 has-text-centered">
        {{ playerTwoLogin }}
      </div>
    </div>
  </div>
</template>
<style>
@import 'https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css';
</style>

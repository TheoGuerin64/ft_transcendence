<script lang="ts">
import { User } from '../types'

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
  <h1>Home</h1>
  <img v-if="user" v-bind:src="user.avatar" width="600" height="500" /><img />
</template>

<script setup lang="ts">
import { useStore } from '../store'
</script>

<script lang="ts">
/**
 * User avatar component (crop the image to a square)
 * @prop size - avatar size
 * @prop image - image URL
 */
export default {
  props: {
    size: {
      type: Number,
      default: 128
    },
    image: {
      type: String,
      default: null
    }
  },

  data() {
    return {
      store: useStore
    }
  }
}
</script>

<template>
  <div
    :style="{
      backgroundImage: `url(${image || store.user!.avatar})`,
      width: `${size}px`,
      height: `${size}px`
    }"
    class="image avatar"
  ></div>
</template>

<style>
.image.avatar {
  background-size: cover;
  background-position: center;
}
</style>

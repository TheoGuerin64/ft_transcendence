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
  }
}
</script>

<template>
  <div
    :style="{
      backgroundImage: `url(${image || '/loading.gif'})`,
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

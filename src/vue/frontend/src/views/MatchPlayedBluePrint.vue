<script>
export default {
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
  <div>
    {{ playerOneLogin }} {{ playerOneScore }}
    <img v-bind:src="playerOneAvatar" />

    {{ playerTwoLogin }} {{ playerTwoScore }}
    <img v-bind:src="playerTwoAvatar" />
  </div>
</template>
<style>
img {
  height: 100px;
  width: auto;
}
</style>

<template>
    <div>
      <h1>Connect to API 42 !</h1>
      <p>
      </p>
    </div>
</template>
  
<script>
  //import io from "socket.io-client";
  export default {
    name: 'API',
    data() {
      return {
        socket: {}
      }
    },
    created() {
      window.location.href = "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-087efa7b62c41e99d1e37bc854a53a4b582043c7c148982838b9c853137e8db7&redirect_uri=http%3A%2F%2F10.11.1.7%3A8080%2F&response_type=code";
    },
    mounted() {
    },
  }
</script>

<style scoped>
</style>
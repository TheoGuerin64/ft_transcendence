<template>
    <div>
      <h1>Welcome to Transcendence !</h1>
      <p>
      </p>
    </div>
</template>
  
<script>
import io from "socket.io-client";
export default {
    name: 'WelcomePage', 
    data() {
      return {
        socket: {}
      }
    },
    created() {
      this.socket = io("http://10.11.1.3:3000");
    },
    mounted() {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      this.socket.emit("sendCode", code)
    },
}
</script>

<style scoped>
</style>
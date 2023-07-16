<template>
  <div>
    <canvas ref="game" width="640" height="480" style="border: 1px solid black;">
    </canvas>
    <p>
      <button v-on:click="move('right')">right</button>
      <button v-on:click="move('left')">left</button>
      <button v-on:click="move('up')">up</button>
      <button v-on:click="move('down')">down</button>
    </p>
  </div>
</template>

<script>
  import io from "socket.io-client";
  export default {
    name: 'BlockGame',
    data() {
      return {
        socket: {},
        context: {},
        position: {
          x: 0,
          y: 0
        }
      }
    },
    created() {
      this.socket = io("http://10.11.1.3:3000");
    },
    mounted() {
      this.context = this.$refs.game.getContext("2d");
      this.socket.on("position", (data) => {
        this.position = data;
        this.context.clearRect(0, 0, this.$refs.game.width, this.$refs.game.height);
        this.context.fillRect(this.position.x, this.position.y, 20, 20);
      });
    },
    methods : {
      move(direction) {
        this.socket.emit("move", direction);
      }
    }
}
</script>

<style scoped>
</style>

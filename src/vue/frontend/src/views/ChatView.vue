<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useStore } from '../store'
import { socket } from '@/socket'
</script>

<script lang="ts">
export default {
  data() {
    return {
      store: useStore,
      showDialog: false,
      channelData: {
        name: '' as string | undefined
      }
    }
  },
  methods: {
    joinChannel(): void {
      socket.emit('join-channel', this.channelData)
      this.$router.push('/chat/' + this.channelData.name)
    },
    leaveChannel(): void {
      socket.emit('leave-channel', this.channelData)
    },
    createChannel(): void {
      socket.emit('create-channel', this.channelData)
      this.showDialog = false
    }
  },
  async mounted() {}
}
</script>

<template>
  <div v-if="!showDialog" id="createChannel">
    <button class="button mt-3 is-link is-outlined" @click="showDialog = !showDialog">
      Create Channel
    </button>
  </div>
  <div v-if="showDialog" id="dialogBox">
    <div id="inputChannel">
      <form @submit="createChannel">
        <input class="input" v-model="channelData.name" placeholder="Channel name" />
      </form>
      <button id="submitButton" class="button is-success" @click="createChannel">
        <FontAwesomeIcon :icon="['far', 'square-plus']" size="lg" />
      </button>
    </div>
    <button id="sendChannel" class="button mt-3 is-link is-outlined" @click="joinChannel">
      Join Channel
    </button>
    <button id="sendChannel" class="button mt-3 is-link is-outlined" @click="leaveChannel">
      Leave Channel
    </button>
  </div>
</template>

<style>
#inputChannel,
#sendChannel {
  display: flex;
  margin-top: 30px;
  margin-left: 30px;
}

#submitButton {
  margin-left: 0.5%;
}

#createChannel {
  margin-left: 30px;
  margin-top: 20px;
}
</style>

<script setup lang="ts">
import { useStore } from '../store'
</script>

<script lang="ts">
const channelData = {
  channelName: '' as string,
  username: '' as string | undefined,
  avatar: '' as string | undefined,
  login: '' as string | undefined
}

export default {
  data() {
    return {
      store: useStore,
      channelName: 'test' as string,
      socket: null as any
    }
  },
  methods: {
    joinChannel(): void {
      console.log('Joining channel ' + this.channelName)
      channelData.username = this.store.user?.name
      channelData.avatar = this.store.user?.avatar
      channelData.channelName = this.channelName
      if (this.store.user?.login === undefined) {
        console.log("You can't join a channel without being logged in")
        return
      }
      channelData.login = this.store.user?.login
      console.log(this.store.user?.name + ' joined ' + this.channelName)
      this.socket.emit('join-channel', channelData)
      this.$router.push('/chat/' + this.channelName)
    },
    leaveChannel(): void {
      console.log('Leaving channel ' + this.channelName)
      channelData.username = this.store.user?.name
      channelData.avatar = this.store.user?.avatar
      channelData.channelName = this.channelName
      if (this.store.user?.login === undefined) {
        console.log("You can't leave a channel without being logged in")
        return
      }
      channelData.login = this.store.user?.login
      console.log(this.store.user?.name + ' left ' + this.channelName)
      this.socket.emit('leave-channel', channelData)
      this.channelName = ''
    }
  },
  async mounted() {
    this.socket = this.store.socket
  }
}
</script>

<template>
  <button id="sendChannel" class="button mt-3 is-link is-outlined" @click="joinChannel">
    Join Channel 'test'
  </button>
  <button id="sendChannel" class="button mt-3 is-link is-outlined" @click="leaveChannel">
    Leave Channel
  </button>
</template>

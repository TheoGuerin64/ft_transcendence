<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'
import { useStore } from '../store'
import { socket } from '@/socket'
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
      channelName: 'test' as string
    }
  },
  methods: {
    joinChannel(): void {
      console.log('Joining channel ' + this.channelName)
      channelData.username = this.store.user?.name
      channelData.avatar = this.store.user?.avatar
      channelData.channelName = this.channelName
      channelData.login = this.store.user?.login
      console.log(this.store.user?.name + ' joined ' + this.channelName)
      socket.emit('join-channel', channelData)
      this.$router.push('/chat/' + this.channelName)
    },
    leaveChannel(): void {
      console.log('Leaving channel ' + this.channelName)
      channelData.username = this.store.user?.name
      channelData.avatar = this.store.user?.avatar
      channelData.channelName = this.channelName
      channelData.login = this.store.user?.login
      console.log(this.store.user?.name + ' left ' + this.channelName)
      socket.emit('leave-channel', channelData)
    }
  },
  async mounted() {}
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

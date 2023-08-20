<script setup lang="ts">
import { socket } from '@/socket'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
</script>

<script lang="ts">
export interface Channel {
  id: number
  name: string
  isPublic: boolean
  isProtected: boolean
  promptPassword: boolean
  showContextMenu: boolean
}

export default {
  name: 'ChannelComponent',
  props: {
    channel: {} as any
  },
  data() {
    return {
      channelData: {
        name: '' as string | undefined,
        isPublic: true as boolean,
        isProtected: false as boolean,
        password: '' as string | undefined
      },
      password: '' as string,
      protectedDialog: false as boolean
    }
  },
  methods: {
    handleContextMenu(e: any, channel: Channel): void {
      e.preventDefault()
      channel.showContextMenu = !channel.showContextMenu
      console.log('context menu')
    },
    submitPassword(): void {
      this.protectedDialog = false
      this.channelData.password = this.password
      this.channelData.isProtected = true
      this.channelData.isPublic = false
    },
    joinChannel(channel: Channel): void {
      this.channelData.name = channel.name
      this.channelData.isPublic = channel.isPublic
      this.channelData.isProtected = channel.isProtected
      this.channelData.password = this.password
      socket.emit('join-channel', this.channelData)
    },
    leaveChannel(channel: Channel): void {
      const data = { name: channel.name }
      console.log('leave channel')
      socket.emit('leave-channel', data)
      location.reload()
      // this.$router.push('/chat')
    },
    removeChannel(channel: Channel): void {
      const data = { name: channel.name }
      console.log('remove channel')
      socket.emit('remove-channel', data)
      location.reload()
      // this.$router.push('/chat')
    }
  }
}
</script>

<template>
  <div v-if="channel.isProtected" id="protectedDialog">
    <a
      class="panel-block"
      @click="joinChannel(channel)"
      @contextmenu="handleContextMenu($event, channel)"
    >
      <span class="panel-icon">
        <FontAwesomeIcon :icon="['fas', 'key']" />
      </span>
      {{ channel.name }}
    </a>
    <div v-if="channel.showContextMenu" class="mt-3">
      <button class="button is-warning is-small ml-3" @click="leaveChannel(channel)">Leave</button>
      <button class="button is-danger is-small ml-3" @click="removeChannel(channel)">Remove</button>
    </div>
    <button
      v-if="!channel.promptPassword"
      class="button is-info ml-3"
      id="protectedButton"
      @click="channel.promptPassword = !channel.promptPassword"
    >
      Join
    </button>
    <div id="passwordInput">
      <input
        v-if="channel.promptPassword"
        class="input"
        v-model="password"
        placeholder="********"
        type="password"
      />
      <button
        v-if="channel.promptPassword"
        class="button is-success ml-1"
        @click="joinChannel(channel)"
      >
        <FontAwesomeIcon :icon="['fas', 'paper-plane']" />
      </button>
    </div>
  </div>
  <a
    v-else
    @click="joinChannel(channel)"
    @contextmenu="handleContextMenu($event, channel)"
    class="panel-block"
  >
    <span v-if="channel.isPublic" class="panel-icon">
      <FontAwesomeIcon :icon="['fas', 'hashtag']" />
    </span>
    <span v-else class="panel-icon">
      <FontAwesomeIcon :icon="['fas', 'lock']" />
    </span>
    {{ channel.name }}
  </a>
  <div v-if="channel.showContextMenu" class="mt-2 mb-2 ml-3">
    <button class="button is-warning is-small ml-3" @click="leaveChannel(channel)">Leave</button>
    <button class="button is-danger is-small ml-3" @click="removeChannel(channel)">Remove</button>
  </div>
</template>

<script setup lang="ts">
import { socket, state } from '@/socket'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import ManageMenu from '@/components/ManageMenu.vue'
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
      manageMenu: false as boolean,
      password: '' as string,
      protectedDialog: false as boolean
    }
  },
  methods: {
    handleContextMenu(e: any, channel: Channel): void {
      e.preventDefault()
      channel.showContextMenu = !channel.showContextMenu
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
      this.$router.push('/chat/' + channel.name)
    },
    leaveChannel(channel: Channel): void {
      const data = { name: channel.name }
      socket.emit('leave-channel', data)
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
    <button
      v-if="!channel.promptPassword"
      class="button is-info is-small mt-1 ml-3"
      id="protectedButton"
      @click="channel.promptPassword = !channel.promptPassword"
    >
      Join
      <!-- <FontAwesomeIcon :icon="['fas', 'circle-arrow-right']" size="xl" /> -->
    </button>
    <div id="passwordInput">
      <form @submit="joinChannel(channel)">
        <input
          v-if="channel.promptPassword"
          class="input"
          v-model="password"
          placeholder="********"
          type="password"
        />
      </form>
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
    <button class="button is-warning is-small ml-3" @click="manageMenu = !manageMenu">
      Manage
    </button>
    <button class="button is-danger is-small ml-3" @click="leaveChannel(channel)">Leave</button>
    <div v-if="manageMenu">
      <ManageMenu :channel="channel" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { socket, state } from '@/socket'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import ManageMenu from '@/components/ManageMenu.vue'
import { useStore } from '@/store'
import axios from 'axios'
import { text } from '@fortawesome/fontawesome-svg-core'
</script>

<script lang="ts">
export interface Channel {
  id: number
  name: string
  isPublic: boolean
  isProtected: boolean
  isDM: boolean
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
        isDM: false as boolean,
        password: '' as string | undefined
      },
      store: useStore,
      role: '' as string,
      manageMenu: false as boolean,
      password: '' as string,
      protectedDialog: false as boolean,
      showInvitation: false as boolean
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
      this.channelData.isDM = channel.isDM
      this.channelData.password = this.password
      socket.emit('join-channel', this.channelData)
    },
    leaveChannel(channel: Channel): void {
      const data = { name: channel.name }
      socket.emit('leave-channel', data)
    },
    async getChannelOwner(): Promise<void> {
      try {
        const response = await axios.get(
          'http://127.0.0.1:3000/channel/owner/' + this.channel.name,
          {
            withCredentials: true
          }
        )
        this.role = response.data
      } catch (error) {
        console.log(error)
      }
    },
    async invite() {
      const login = (document.getElementById('invite-login') as HTMLInputElement).value
      try {
        const response = await axios.post(
          'http://127.0.0.1:3000/invitation',
          {
            channel: this.channel.name,
            login: login,
            socket_id: socket.id.toString()
          },
          { withCredentials: true }
        )
      } catch (error) {
        if (axios.isAxiosError(error)) {
          this.$notify({
            type: 'error',
            text: error.response?.data.message
          })
        }
      }
    }
  },
  computed: {
    isPrivate(): boolean {
      return !this.channel.isProtected && !this.channel.isPublic
    }
  },
  async created() {
    await this.getChannelOwner()
  }
}
</script>

<template>
  <div v-if="channel.isProtected" class="is-flex">
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
      @click="channel.promptPassword = !channel.promptPassword"
    >
      <FontAwesomeIcon :icon="['fas', 'fingerprint']" size="xl" />
    </button>
    <div class="is-flex">
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
        <FontAwesomeIcon :icon="['fas', 'fingerprint']" />
      </button>
    </div>
  </div>
  <a
    v-else
    @click="joinChannel(channel)"
    @contextmenu="handleContextMenu($event, channel)"
    class="panel-block"
  >
    <span v-if="channel.isDM" class="panel-icon">
      <FontAwesomeIcon :icon="['fas', 'envelope']" />
    </span>
    <span v-else-if="channel.isPublic" class="panel-icon">
      <FontAwesomeIcon :icon="['fas', 'hashtag']" />
    </span>
    <span v-else class="panel-icon">
      <FontAwesomeIcon :icon="['fas', 'lock']" />
    </span>
    {{ channel.name }}
  </a>
  <div v-if="channel.showContextMenu" class="mt-2 mb-2 ml-3">
    <button
      v-if="role === 'owner'"
      class="button is-warning is-small ml-3"
      @click="manageMenu = !manageMenu"
    >
      Manage
    </button>
    <button class="button is-danger is-small ml-3" @click="leaveChannel(channel)">Leave</button>
    <div v-if="manageMenu && role === 'owner'">
      <ManageMenu :channel="channel" />
    </div>
    <input
      v-if="showInvitation && role === 'owner' && isPrivate"
      class="input is-small ml-2"
      id="invite-login"
      type="text"
      placeholder="login"
      style="width: 10%"
    />
    <button
      v-if="role === 'owner' && isPrivate"
      class="button is-info is-small ml-3"
      @click="showInvitation ? invite() : (showInvitation = !showInvitation)"
    >
      Invite
    </button>
  </div>
</template>

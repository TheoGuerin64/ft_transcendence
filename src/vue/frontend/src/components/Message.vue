<script setup lang="ts">
import UserAvatar from './UserAvatar.vue'
import { socket } from '@/socket'
import { useStore } from '@/store'
</script>

<script lang="ts">
export default {
  name: 'Message',
  props: {
    avatar: String,
    login: String,
    username: String,
    content: String,
    channelName: String
  },
  data() {
    return {
      store: useStore,
      profile: 'http://127.0.0.1:8080/profile/public/' + this.login,
      showContextMenu: false as boolean
    }
  },
  methods: {
    inviteToGame(login: string): void {
      console.log('Inviting ', login, ' to game')
    },
    handleContextMenu(e: any): void {
      e.preventDefault()
      if (this.login === this.store.user?.login) return
      this.showContextMenu = !this.showContextMenu
    },
    kick(): void {
      const data = {
        channelName: this.channelName,
        login: this.login
      }
      socket.emit('kick-user', data)
    },
    mute(): void {
      const data = {
        channelName: this.channelName,
        login: this.login
      }
      socket.emit('mute-user', data)
    },
    ban(): void {
      const data = {
        channelName: this.channelName,
        login: this.login
      }
      socket.emit('ban-user', data)
    },
    block(): void {
      const data = {
        channelName: this.channelName,
        login: this.login
      }
      socket.emit('block-user', data)
    }
  }
}
</script>

<template>
  <div id="messages" class="box is-large columns mb-2 mt-2 is-flex-grow-1">
    <div class="column is-narrow is-flex is-flex-direction-column is-justify-content-center">
      <a @contextmenu="handleContextMenu($event)" :href="profile"
        ><UserAvatar :image="avatar" :size="40" class="round-image"
      /></a>
    </div>
    <div v-if="showContextMenu" class="mt-2 mb-2 ml-3">
      <button class="button is-success ml-2" @click="inviteToGame(login as string)">
        Invite to game
      </button>
      <button class="button is-info ml-3" @click="kick">Kick</button>
      <button class="button is-warning ml-3" @click="mute">Mute</button>
      <button class="button is-danger ml-3" @click="ban">Ban</button>
      <button class="button is-danger ml-3" @click="block">Block</button>
    </div>
    <div
      v-else
      class="column is-flex is-flex-direction-column is-justify-content-center is-flex-wrap-wrap"
    >
      <p class="has-text-left is-size-5 break-word">{{ content }}</p>
    </div>
  </div>
</template>

<style>
.round-image {
  border-radius: 50%;
}

.break-word {
  overflow-wrap: break-word;
  word-wrap: break-all;
}

#messages {
  height: 60px;
}
</style>

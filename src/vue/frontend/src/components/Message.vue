<script setup lang="ts">
import UserAvatar from './UserAvatar.vue'
import { socket } from '@/socket'
import { useStore } from '@/store'
</script>

<script lang="ts">
export default {
  name: 'Message',
  props: {
    id: Number,
    avatar: String,
    login: String,
    username: String,
    content: String
  },
  data() {
    return {
      store: useStore,
      role: '' as string,
      operator: false as boolean,
      profile: 'http://127.0.0.1:8080/profile/public/' + this.login,
      channelName: this.$route.params.channelId as string,
      showContextMenu: false as boolean
    }
  },
  methods: {
    handleContextMenu(e: any): void {
      e.preventDefault()
      if (this.login === this.store.user?.login) return
      this.showContextMenu = !this.showContextMenu
    },
    inviteToGame(login: string): void {
      console.log('Inviting ', login, ' to game')
    },
    block(): void {
      const data = {
        channelName: this.channelName,
        login: this.login
      }
      socket.emit('block-user', data)
      this.$emit('block-user', this.login)
    },
    createDM(): void {
      socket.emit('create-dm', this.login)
    }
  }
}
</script>

<template>
  <div class="box is-small columns mb-2 mt-2 is-flex-grow-1 pt-2 pb-2">
    <div class="column is-narrow is-flex is-flex-direction-column is-justify-content-center">
      <a @contextmenu="handleContextMenu($event)" :href="profile"
        ><UserAvatar :image="avatar" :size="40" class="round-image mt-4" />
        <p class="has-text is-size-7">{{ username }}</p>
      </a>
    </div>
    <div v-if="showContextMenu" class="mt-2 mb-2 ml-3 center-vertically">
      <button class="button is-success ml-2" @click="inviteToGame(login as string)">
        Invite to game
      </button>
      <button class="button is-danger ml-3" @click="block">Block</button>
      <button class="button is-info ml-3" @click="createDM">New DM</button>
    </div>
    <p v-else class="has-text-left is-size-5 break-word center-vertically ml-2">{{ content }}</p>
  </div>
</template>

<style>
.round-image {
  border-radius: 50%;
}

.break-word {
  display: inline-block;
  word-break: break-word;
}

.center-vertically {
  display: flex;
  align-items: center;
}
</style>

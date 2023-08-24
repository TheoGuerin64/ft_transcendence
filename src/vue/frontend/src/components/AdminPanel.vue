<script setup lang="ts">
import axios from 'axios'
import UserAvatar from './UserAvatar.vue'
import { useStore } from '@/store'
import { socket } from '@/socket'
</script>

<script lang="ts">
interface User {
  id: number
  login: string
  name: string
  avatar: string
  role: string
}

export default {
  name: 'AdminPanel',
  props: {
    role: String
  },
  data() {
    return {
      store: useStore,
      channelName: this.$route.params.channelId as string,
      Users: [] as User[]
    }
  },
  methods: {
    async getUsers(): Promise<void> {
      console.log('Getting users', this.$route.params.channelId)
      try {
        const response = await axios.get(
          'http://127.0.0.1:3000/channel/members/' + this.$route.params.channelId,
          {
            withCredentials: true
          }
        )
        for (let i = 0; i < response.data.length; i++) {
          this.Users.push(response.data[i])
          this.Users[i].id = i
        }
      } catch (error) {
        console.log(error)
      }
    },
    kick(login: string): void {
      const data = {
        channelName: this.channelName,
        login: login
      }
      socket.emit('kick-user', data)
    },
    mute(login: string): void {
      const data = {
        channelName: this.channelName,
        login: login
      }
      socket.emit('mute-user', data)
    },
    ban(login: string): void {
      const data = {
        channelName: this.channelName,
        login: login
      }
      socket.emit('ban-user', data)
    },
    setAdmin(login: string): void {
      const data = {
        channelName: this.channelName,
        login: login
      }
      socket.emit('set-admin', data)
    }
  },
  async mounted() {
    await this.getUsers()
    console.log('users', this.Users)
  }
}
</script>
<template>
  <div class="mt-3 mb-4 admin-panel">
    <nav class="panel column is-10" id="channelPanel">
      <p class="panel-heading">Users</p>
      <div v-for="user in Users" :key="user.id" class="user-panel">
        <div class="user-info">
          <UserAvatar :image="user.avatar" :size="40" class="round-image mt-4" />
          <p class="has-text is-size-7">{{ user.name }}</p>
        </div>
        <div class="user-actions">
          <button class="button is-small is-info" @click="kick(user.login)">Kick</button>
          <button class="button is-small is-warning" @click="mute(user.login)">Mute</button>
          <button class="button is-small is-danger" @click="ban(user.login)">Ban</button>
          <button
            v-if="role === 'owner'"
            class="button is-small is-success"
            @click="setAdmin(user.login)"
          >
            Set admin
          </button>
        </div>
      </div>
    </nav>
  </div>
</template>

<style>
.user-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  border-bottom: 1px solid #ccc;
}

.user-actions {
  display: flex;
  gap: 10px;
}

.admin-panel {
  width: 50%;
  float: right;
}
</style>
<!-- 
<template>
  <div class="admin-panel">
    <nav class="panel column is-10" id="channelPanel">
      <p class="panel-heading">Users</p>
      <div v-for="user in Users" :key="user.id" class="users">
        <a class="panel-block">
          <span class="panel-icon">
            <UserAvatar :image="user.avatar" :size="40" class="round-image mt-4" />
            <p class="has-text is-size-7">{{ user.name }}</p>
          </span>
          <button class="button is-small is-info ml-3" @click="kick">Kick</button>
          <button class="button is-small is-warning ml-3" @click="mute">Mute</button>
          <button class="button is-small is-danger ml-3" @click="ban">Ban</button>
          <button class="button is-small is-success ml-3" @click="setAdmin">Set admin</button>
        </a>
      </div>
    </nav>
  </div>
</template>

<style>
.admin-panel {
  width: 50%;
}

.users {
  display: flex;
}
</style> -->

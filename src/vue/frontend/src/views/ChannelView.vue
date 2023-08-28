<script setup lang="ts">
import { useStore } from '../store'
import Message from '../components/Message.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { state, socket, setRouterInstance } from '@/socket'
import axios from 'axios'
import AdminPanel from '@/components/AdminPanel.vue'
</script>

<script lang="ts">
interface Channel {
  id: number
  name: string
  isPublic: boolean
  isProtected: boolean
}

export default {
  components: {
    Message
  },
  data() {
    return {
      store: useStore,
      state: state,
      message: '' as string,
      blockedUsers: [] as string[],
      role: '' as string,
      operator: false as boolean,
      adminPanel: false as boolean,
      channel: null as any,
      channelName: this.$route.params.channelId
    }
  },
  methods: {
    async getChannel(): Promise<void> {
      try {
        const response = await axios.get('http://127.0.0.1:3000/channel/' + this.channelName, {
          withCredentials: true
        })
        this.channel = response.data
      } catch (error) {
        console.log(error)
      }
    },
    async getMessages(): Promise<void> {
      try {
        const response = await axios.get(
          'http://127.0.0.1:3000/channel/messages/' + this.channelName,
          {
            withCredentials: true
          }
        )
        for (let i = 0; i < response.data.length; i++) {
          this.state.Messages.push({ id: i, data: response.data[i] })
        }
      } catch (error) {
        console.log(error)
      }
    },
    async getBlockedUsers(): Promise<void> {
      try {
        this.blockedUsers = []
        const response = await axios.get('http://127.0.0.1:3000/user/blocked', {
          withCredentials: true
        })
        for (let i = 0; i < response.data.length; i++) {
          this.blockedUsers.push(response.data[i])
        }
      } catch (error) {
        console.log(error)
      }
      console.log('Blocked users: ', this.blockedUsers)
    },
    async getRole(): Promise<void> {
      try {
        const response = await axios.get(
          'http://127.0.0.1:3000/channel/owner/' + this.channelName,
          {
            withCredentials: true
          }
        )
        this.role = response.data
      } catch (error) {
        console.log(error)
      }
    },
    submitNewMessage(event: Event): void {
      if (event) {
        event.preventDefault()
      }

      const messageData = {
        content: '' as string,
        channelName: '' as string | undefined
      }
      messageData.content = this.message
      messageData.channelName = this.channelName as string
      socket.emit('message', messageData)
      this.message = ''
    },
    leave(): void {
      const data = { name: this.channelName }
      this.$router.push('/chat')
    }
  },
  async mounted() {
    const data = { name: this.channelName as string }
    state.Messages = []
    await this.getRole()
    this.operator = this.role === 'owner' || this.role === 'admin'
    await this.getChannel()
    socket.emit('reconnect', data)
    await this.getBlockedUsers()
    await this.getMessages()
    this.state.channelName = this.$route.params.channelId as string
  },
  async updated() {
    let elem = document.getElementById('chatDisplay')
    if (elem) {
      elem.scrollTop = elem.scrollHeight
    }
  }
}
</script>

<template>
  <main>
    <div class="header">
      <div class="mt-3 ml-4">
        <h1 class="title is-size-3-desktop has-text-dark">{{ channelName }}</h1>
      </div>
      <div v-if="operator" class="mt-3 mr-4" @click="adminPanel = !adminPanel">
        <FontAwesomeIcon :icon="['fas', 'user-gear']" size="2xl" />
      </div>
    </div>
    <div v-if="adminPanel">
      <AdminPanel :role="role" />
    </div>
    <div class="chatDisplay">
      <ul>
        <template v-for="message in state.Messages" :key="message.id">
          <li v-if="!blockedUsers.includes(message.data.user.login)">
            <Message
              @block-user="(login) => blockedUsers.push(login)"
              :id="message.id"
              :avatar="message.data.user.avatar"
              :login="message.data.user.login"
              :username="message.data.user.name"
              :content="message.data.content"
            />
          </li>
        </template>
      </ul>
    </div>
    <div class="sendBar">
      <form @submit="submitNewMessage">
        <input class="input" v-model="message" />
      </form>
      <button class="button is-success ml-2" @click="submitNewMessage">
        <FontAwesomeIcon :icon="['fas', 'paper-plane']" />
      </button>
      <button class="button is-danger ml-5" @click="leave">
        <FontAwesomeIcon :icon="['fas', 'right-to-bracket']" />
      </button>
    </div>
  </main>
</template>

<style>
.chatDisplay {
  width: 90%;
  height: 600px;
  border: solid;
  border-radius: 5px;
  margin-right: 5%;
  margin-left: 5%;
  margin-top: 2%;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: auto;
}

.messages {
  margin: 1%;
  padding: 0;
}

.messages li {
  list-style-type: none;
  padding: 1%;
  margin-top: 1%;
}

.sendBar {
  width: 40%;
  display: flex;
  margin-top: 2%;
  margin-left: 6%;
}

.sendChannel {
  margin-left: 2%;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

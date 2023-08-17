<script setup lang="ts">
import { useStore } from '../store'
import { Socket, io } from 'socket.io-client'
import Message from '../components/Message.vue'
import UserAvatar from '@/components/UserAvatar.vue'
</script>

<script lang="ts">
const messageData = {
  content: '' as string,
  username: '' as string | undefined,
  avatar: '' as string | undefined,
  channelName: '' as string | undefined,
  login: '' as string | undefined
}

export default {
  components: {
    Message
  },
  data() {
    return {
      store: useStore,
      Messages: [] as Array<{
        id: number
        data: any
      }>,
      message: '' as string,
      channelName: '' as string,
      id: 0,
      socket: null as any
    }
  },
  async mounted() {
    this.channelName = this.$route.params.channelId as string
    this.socket = this.store.socket
    this.socket.on('message', (msg: string, username: string, avatar: string) => {
      this.Messages.push({
        id: this.id++,
        data: {
          content: msg,
          username: username,
          avatar: avatar
        }
      })
    })
    this.socket.on('user-joined', (username: string, avatar: string) => {
      this.Messages.push({
        id: this.id++,
        data: {
          content: username + ' has joined the channel ' + this.channelName,
          avatar: avatar
        }
      })
    })
    this.socket.on('user-left', (username: string) => {
      this.Messages.push({
        id: this.id++,
        data: {
          content: username + ' has left the channel ' + this.channelName,
          avatar: this.store.user?.avatar
        }
      })
    })
    this.socket.on('notification', (message: string) => {
      this.$notify({
        type: 'error',
        text: message
      })
    })
  },
  methods: {
    submitNewMessage(): void {
      messageData.content = this.message
      messageData.username = this.store.user?.name
      messageData.avatar = this.store.user?.avatar
      messageData.channelName = this.channelName
      messageData.login = this.store.user?.login
      this.socket.emit('message', messageData)
    }
  }
}
</script>

<template>
  <main>
    <div class="mt-3 ml-4">
      <h1 class="title is-size-1-desktop has-text-dark">Home</h1>
    </div>
    <div id="chatDisplay">
      <ul>
        <li v-for="message in Messages" :key="message.id">
          <Message
            :username="message.data.username"
            :content="message.data.content"
            :avatar="message.data.avatar"
            :login="message.data.login"
          />
        </li>
      </ul>
    </div>
    <div id="sendBar">
      <input id="inputMessage" v-model="message" />
      <button id="sendMessage" @click="submitNewMessage">SEND</button>
    </div>
  </main>
</template>

<style>
#chatDisplay {
  width: 90%;
  height: 600px;
  border: solid;
  border-radius: 15px;
  margin-right: 5%;
  margin-left: 5%;
  margin-top: 2%;
  overflow: auto;
  scrollbar-width: auto;
}

#messages {
  margin: 1%;
  padding: 0;
}

#messages li {
  list-style-type: none;
  padding: 1%;
  margin-top: 1%;
}

#sendBar {
  width: 40%;
  display: flex;
  margin-top: 2%;
  margin-left: 6%;
}

#sendMessage {
  margin-left: 2%;
}

#inputMessage {
  border-radius: 5px;
  width: 100%;
}

#sendChannel {
  margin-left: 2%;
}

#inputChannel {
  border-radius: 5px;
  width: 100%;
  margin-left: 8%;
}
</style>

<script setup lang="ts">
import { useStore } from '../store'
import { io } from 'socket.io-client'
</script>

<script lang="ts">
const messageData = {
  message: '' as string,
  username: '' as string | undefined,
  channelName: '' as string | undefined,
  login: '' as string | undefined
}

const channelData = {
  channelName: '' as string,
  username: '' as string | undefined,
  login: '' as string | undefined
}

export default {
  data() {
    return {
      store: useStore,
      message: '' as string,
      channelName: '' as string,
      socket: null as any
    }
  },
  methods: {
    submitNewMessage(): void {
      if (this.channelName === '') {
        console.log("You can't send a message without joining a channel")
        return
      }
      messageData.message = this.message
      messageData.username = this.store.user?.name
      messageData.channelName = this.channelName
      messageData.login = this.store.user?.login
      this.socket.emit('message', messageData)
    },
    joinChannel(): void {
      channelData.username = this.store.user?.name
      channelData.channelName = this.channelName
      if (this.store.user?.login === undefined) {
        console.log("You can't join a channel without being logged in")
        return
      }
      channelData.login = this.store.user?.login
      console.log(this.store.user?.name + ' joined ' + this.channelName)
      this.socket.emit('join-channel', channelData)
    },
    leaveChannel(): void {
      channelData.username = this.store.user?.name
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
    this.socket = io('http://localhost:3000')
    this.socket.on('message', function (msg: string, username: string) {
      const messages = document.getElementById('messages')
      const item = document.createElement('li')
      const link = document.createElement('a')
      if (msg === '') {
        return
      }
      if (username !== null) {
        link.textContent = username
        link.href = 'http://localhost:8080/profile/' + username
        item.appendChild(link)
      }
      item.append(msg)
      messages?.appendChild(item)
    })
    this.socket.on('user-joined', (username: string) => {
      const messages = document.getElementById('messages')
      const item = document.createElement('li')
      item.append(username + ' has joined the channel ', this.channelName)
      messages?.appendChild(item)
    })
    this.socket.on('user-left', (username: string) => {
      const messages = document.getElementById('messages')
      const item = document.createElement('li')
      item.append(username + ' has left the channel')
      messages?.appendChild(item)
    })
    this.socket.on('notification', (message: string) => {
      console.log(message)
      this.$notify({
        type: 'error',
        text: message
      })
    })
  }
}
</script>

<template>
  <main>
    <div class="mt-3 ml-4">
      <h1 class="title is-size-1-desktop has-text-dark">Home</h1>
    </div>
    <div id="chatDisplay">
      <ul id="messages"></ul>
    </div>
    <div id="sendBar">
      <input id="inputMessage" v-model="message" />
      <button id="sendMessage" @click="submitNewMessage">SEND</button>
      <input id="inputChannel" v-model="channelName" />
      <button id="sendChannel" @click="joinChannel">Join Channel</button>
      <button id="sendChannel" @click="leaveChannel">Leave Channel</button>
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

#messages li a {
  text-decoration: inherit;
  color: inherit;
  padding: 1%;
  background-color: bisque;
  border-radius: 5px;
  margin-right: 2%;
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

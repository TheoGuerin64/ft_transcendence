<script setup lang="ts">
import axios from 'axios'
import { store } from '../store'
import { io } from 'socket.io-client'
</script>

<script lang="ts">
async function signin(code: string) {
  const response = await axios.get('http://127.0.0.1:3000/auth/sign-in?code=' + code, {
    withCredentials: true
  })
  console.log(response)
}

async function signout() {
  const response = await axios.get('http://127.0.0.1:3000/auth/sign-out', {
    withCredentials: true
  })
  console.log(response)
}

async function getUser() {
  const response = await axios.get('http://127.0.0.1:3000/user/me', {
    withCredentials: true
  })
  console.log(response)
}

const messageData = {
  message: '' as string,
  userName: '' as string | undefined
}

export default {
  data() {
    return {
      store,
      message: '',
      socket: null as any
    }
  },
  methods: {
    submitNewMessage(): void {
      messageData.message = this.message
      messageData.userName = this.store.user?.name
      this.socket.emit('message', messageData)
    }
  },
  async mounted() {
    const code = this.$route.query.code
    if (code) {
      signin(code as string)
      this.$router.push('/')
    }
    this.socket = io('http://localhost:3000')
    this.socket.on('message', function (msg: string, userName: string) {
      const messages = document.getElementById('messages')
      const item = document.createElement('li')
      const link = document.createElement('a')
      if (msg === '') {
        return
      }
      link.textContent = userName
      if (userName === '') {
        return
      }
      link.href = 'http://localhost:3000/profile/' + userName
      item.appendChild(link)
      item.append(msg)
      messages?.appendChild(item)
    })
  }
}
</script>

<template>
  <main>
    <a href="http://127.0.0.1:3000/auth/authorize">connect</a>
    <button @click="signout">Sign Out</button>
    <button @click="getUser">Get User</button>
    <div id="chatDisplay">
      <ul id="messages"></ul>
    </div>
    <div id="sendBar">
      <input id="inputBar" v-model="message" />
      <button id="sendButton" @click="submitNewMessage">SEND</button>
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
  width: 30%;
  display: flex;
  margin-top: 2%;
  margin-left: 6%;
}

#sendButton {
  margin-left: 2%;
}

#inputBar {
  border-radius: 5px;
  width: 100%;
}
</style>

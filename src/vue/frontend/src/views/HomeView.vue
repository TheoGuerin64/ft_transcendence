<script setup lang="ts">
import axios from 'axios'
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

export default {
  data() {
    return {
      message: '',
      socket: null as any
    }
  },
  methods: {
    submitNewMessage(): void {
      console.log('submitting message', this.message)
      this.socket.emit('message', this.message)
    }
  },
  async mounted() {
    const code = this.$route.query.code
    this.socket = io('http://localhost:3000')
    if (code) {
      signin(code as string)
      this.$router.push('/')
    }
    this.socket.on('message', function (msg: string) {
      console.log(msg)
      const messages = document.getElementById('messages')
      const item = document.createElement('li')
      item.textContent = msg
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
    <input v-model="message" />
    <button @click="submitNewMessage">Submit</button>
    <ul id="messages"></ul>
  </main>
</template>

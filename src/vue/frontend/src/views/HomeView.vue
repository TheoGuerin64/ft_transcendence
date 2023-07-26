<script setup lang="ts">
import axios from 'axios'
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
  async mounted() {
    const code = this.$route.query.code
    if (code) {
      signin(code as string)
      this.$router.push('/')
    }
  }
}
</script>

<template>
  <main>
    <a href="http://127.0.0.1:3000/auth/authorize">connect</a>
    <button @click="signout">Sign Out</button>
    <button @click="getUser">Get User</button>
  </main>
</template>

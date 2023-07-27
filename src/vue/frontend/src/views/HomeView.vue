<script setup lang="ts">
import axios from 'axios'
import { store } from '../store'
</script>

<script lang="ts">
function signout() {
  axios
    .get('http://127.0.0.1:3000/auth/sign-out', {
      withCredentials: true
    })
    .then(() => {
      store.setUser(undefined)
    })
}

export default {
  data() {
    return {
      store
    }
  },

  mounted() {
    const code = this.$route.query.code as string | undefined
    if (code) {
      this.$router.replace('/')
      axios
        .get('http://127.0.0.1:3000/auth/sign-in?code=' + code, {
          withCredentials: true
        })
        .then((response) => {
          this.store.setToken(response.data)
          axios
            .get('http://127.0.0.1:3000/user/me', {
              withCredentials: true
            })
            .then((response) => {
              this.store.setUser(response.data)
            })
        })
    }
  }
}
</script>

<template>
  <main>
    <div v-if="store.user">
      <h1>{{ store.user.name }}</h1>
      <img :src="store.user.avatar" alt="User avatar" />
    </div>
    <a href="http://127.0.0.1:3000/auth/authorize">connect</a>
    <button @click="signout">Sign Out</button>
  </main>
</template>

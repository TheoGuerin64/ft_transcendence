<script setup lang="ts">
import axios from 'axios'
import UserItem from '../components/UserItem.vue'
</script>

<script lang="ts">
interface PublicUser {
  name: string
  login: string
  avatar: string
}

/**
 * ProfileSearchView component (shows the list of users)
 */
export default {
  data() {
    return {
      users: [] as PublicUser[],
      search: ''
    }
  },

  async mounted() {
    const response = await axios.get('http://127.0.0.1:3000/user/list', {
      withCredentials: true
    })

    // Sort users by login
    this.users = response.data.sort((a: PublicUser, b: PublicUser) => {
      return a.login.localeCompare(b.login)
    })
  },

  computed: {
    filteredUsers() {
      // Filter users by name or login
      return this.users.filter((user: PublicUser) => {
        return (
          user.name.toLowerCase().includes(this.search.toLowerCase()) ||
          user.login.toLowerCase().includes(this.search.toLowerCase())
        )
      })
    }
  }
}
</script>

<template>
  <main>
    <input type="text" class="input" placeholder="Search..." v-model="search" />
    <div class="is-flex is-flex-wrap-wrap">
      <UserItem v-for="user in filteredUsers" :key="user.login" :user="user" />
    </div>
  </main>
</template>

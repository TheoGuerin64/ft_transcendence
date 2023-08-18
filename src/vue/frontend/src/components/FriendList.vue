<script setup lang="ts">
import axios from 'axios'
import FriendItem from './FriendItem.vue'
</script>

<script lang="ts">
export default {
  data() {
    return {
      friends: [] as any[]
    }
  },

  async mounted() {
    const response = await axios.get('http://127.0.0.1:3000/user/friends', {
      withCredentials: true
    })
    this.friends = response.data
  },

  methods: {
    removeFriend(friend: any) {
      this.friends = this.friends.filter((f) => f.login != friend.login)
    },

    acceptFriend(friend: any) {
      friend.accepted = true
    }
  }
}
</script>

<template>
  <div class="is-flex is-flex-direction-column">
    <div class="is-flex is-justify-content-space-between is-align-items-center">
      <h1 class="is-size-3">Friends</h1>
      <RouterLink to="/profile/search" class="button is-link is-small">Search</RouterLink>
    </div>
    <div class="is-flex is-flex-direction-column">
      <FriendItem
        v-for="friend in friends"
        :key="friend.login"
        :friend="friend"
        @accept="acceptFriend(friend)"
        @remove="removeFriend(friend)"
      />
    </div>
  </div>
</template>

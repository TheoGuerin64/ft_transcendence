<script setup lang="ts">
import axios from 'axios'
import FriendElement from './FriendElement.vue'
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
    <h1 class="is-size-3">Friends</h1>
    <div class="is-flex is-flex-direction-column">
      <FriendElement
        v-for="friend in friends"
        :key="friend.login"
        :friend="friend"
        @accept="acceptFriend(friend)"
        @remove="removeFriend(friend)"
      />
    </div>
  </div>
</template>

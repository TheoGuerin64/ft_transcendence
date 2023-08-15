<script setup lang="ts">
import axios from 'axios'
import UserAvatar from './UserAvatar.vue'
</script>

<script lang="ts">
/**
 * Friend element
 * @prop friend object
 * @event accept emit when friend is accepted
 * @event remove emit when friend is removed
 */
export default {
  props: {
    friend: {
      type: Object,
      required: true
    }
  },

  computed: {
    /**
     * button text depending on friend status
     */
    buttonText() {
      if (this.friend.accepted) {
        return 'Remove'
      } else if (this.friend.sender) {
        return 'Cancel'
      } else {
        return 'Refuse'
      }
    }
  },

  methods: {
    /**
     * Accept friend request
     */
    async acceptFriend(): Promise<void> {
      try {
        await axios.post(
          'http://127.0.0.1:3000/user/friends/accept',
          { login: this.friend.login },
          { withCredentials: true }
        )
      } catch (error) {
        if (axios.isAxiosError(error) && error.response && error.response.status == 400) {
          this.$notify({
            type: 'error',
            text: error.response.data.message
          })
          return
        }
      }
      this.$emit('accept')
    },

    /**
     * Remove friend request
     */
    async removeFriend(): Promise<void> {
      try {
        await axios.post(
          'http://127.0.0.1:3000/user/friends/remove',
          { login: this.friend.login },
          { withCredentials: true }
        )
      } catch (error) {
        if (axios.isAxiosError(error) && error.response && error.response.status == 400) {
          this.$notify({
            type: 'error',
            text: error.response.data.message
          })
          return
        }
      }
      this.$emit('remove')
    }
  }
}
</script>

<template>
  <div class="is-flex is-justify-content-space-between is-align-items-center mb-2">
    <a class="friend-info is-flex" :href="'/profile/public/' + friend.login">
      <UserAvatar :image="friend.avatar" :size="64" />
      <div class="is-flex is-flex-direction-column is-justify-content-center ml-3">
        <span class="is-size-5 has-dark-text">{{ friend.name }}</span>
        <span class="is-size-6">{{ friend.login }}</span>
      </div>
    </a>
    <p
      v-if="!friend.accepted && friend.sender"
      class="pending dots-animation is-size-6 has-text-warning"
    >
      Pending
    </p>
    <div>
      <button class="button is-danger is-outlined is-pulled-right" @click="removeFriend">
        {{ buttonText }}
      </button>
      <button
        v-if="!friend.sender && !friend.accepted"
        class="button is-success is-outlined is-pulled-right"
        @click="acceptFriend"
      >
        Accept
      </button>
    </div>
  </div>
</template>

<style>
.friend-info {
  color: #4a4a4a;
}

.pending {
  width: 4.75em;
}
</style>

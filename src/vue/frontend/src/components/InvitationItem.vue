<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import UserAvatar from './UserAvatar.vue'
import axios from 'axios'
import { socket } from '../socket'
</script>

<script lang="ts">
export default {
  props: {
    invitation: {
      type: Object,
      required: true
    }
  },

  methods: {
    async refuseInvitation() {
      try {
        await axios.post(
          'http://127.0.0.1:3000/invitation/refuse',
          { id: this.invitation.id },
          { withCredentials: true }
        )
        this.$emit('remove')
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.log(error.response?.data)
        }
      }
    },

    async acceptInvitation() {
      await axios.post(
        'http://127.0.0.1:3000/invitation/accept',
        { id: this.invitation.id, socket_id: socket.id.toString() },
        { withCredentials: true }
      )
      this.$emit('remove')
    }
  }
}
</script>

<template>
  <div class="is-flex is-justify-content-space-between">
    <div>
      <UserAvatar :image="invitation.requester.avatar" />
      <span>{{ invitation.requester.login }}</span>
    </div>
    <div class="invitation-text">
      <span>
        {{
          invitation.channel
            ? ' invited to join the channel ' + invitation.channel.name
            : 'Invited to a game'
        }}
        <div class="is-flex is-justify-content-space-around mt-2">
          <button class="button is-small is-success" @click="acceptInvitation">Accept</button>
          <FontAwesomeIcon
            v-if="!invitation.channel"
            :icon="['fas', 'bolt']"
            beat
            style="color: #f5c211"
            size="2xl"
            class="mx-2"
          />
          <FontAwesomeIcon v-else :icon="['fas', 'envelope']" bounce size="2xl" class="mx-2" />
          <button class="button is-small is-danger" @click="refuseInvitation">Decline</button>
        </div>
      </span>
    </div>
    <div>
      <UserAvatar :image="invitation.requested.avatar" />
      <span>{{ invitation.requested.login }}</span>
    </div>
  </div>
</template>

<style>
.invitation-text {
  width: 14rem;
  text-align: center;
}
</style>

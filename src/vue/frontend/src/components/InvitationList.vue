<script setup lang="ts">
import axios from 'axios'
import InvitationItem from './InvitationItem.vue'
</script>

<script lang="ts">
export default {
  data() {
    return {
      invitations: [] as any[]
    }
  },

  async mounted() {
    const response = await axios.get('http://127.0.0.1:3000/invitation', { withCredentials: true })
    this.invitations = response.data
  }
}
</script>

<template>
  <div class="is-flex is-flex-direction-column">
    <h1 class="is-size-3">Invitations</h1>
    <div class="is-flex is-flex-direction-column">
      <InvitationItem
        v-for="invitation in invitations"
        :key="invitation.login"
        :invitation="invitation"
        @remove="invitations.splice(invitations.indexOf(invitation), 1)"
      />
    </div>
  </div>
</template>

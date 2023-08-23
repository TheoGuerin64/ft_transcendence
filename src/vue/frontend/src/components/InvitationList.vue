<script setup lang="ts">
import axios from 'axios'
import InvitationItem from './InvitationItem.vue'
</script>

<script lang="ts">
export default {
  data() {
    return {
      invitations: [{ login: 'tguerin' }] as any[]
    }
  },

  async mounted() {}
}
</script>

<template>
  <div class="is-flex is-flex-direction-column">
    <h1 class="is-size-3">Friends</h1>
    <div class="is-flex is-flex-direction-column">
      <InvitationItem
        v-for="invitation in invitations"
        :key="invitation.login"
        :invitation="invitation"
      />
    </div>
  </div>
</template>

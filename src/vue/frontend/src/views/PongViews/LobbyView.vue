<script setup lang="ts">
import { state } from '../../socket'
import { playerStatus } from '../../store'
</script>

<script lang="ts">
export default {
  methods: {
    emitJoinQueue(gameType: string) {
      this.$emit('joinQueue', gameType)
    }
  }
}
</script>

<template>
  <div v-if="state.gameParam.status === playerStatus.LOBBY">
    <button @click="emitJoinQueue('normal')" class="button mx-3 is-light">Join Normal Queue</button>
    <button @click="emitJoinQueue('custom')" class="button mx-3 is-light">Join Custom Queue</button>
  </div>
</template>

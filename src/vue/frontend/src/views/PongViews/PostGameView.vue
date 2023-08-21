<script setup lang="ts">
import { state } from '../../socket'
import { playerStatus } from '../../store'
</script>

<script lang="ts">
export default {
  methods: {
    emitReturnLobby() {
      this.$emit('joinLobby')
    }
  }
}
</script>

<template>
  <div v-if="state.gameParam.status === playerStatus.POSTGAME" class="box">
    <p v-if="state.gameParam.winner === 'surrender'">
      the other player left the game, you won by forfeit
    </p>
    <p v-else>
      the winner is {{ state.gameParam.winner }} ! The score is
      {{ state.gameParam.scorePlayerOne }} - {{ state.gameParam.scorePlayerTwo }}
    </p>
    <button @click="emitReturnLobby" class="button mx-3 is-light">return to lobby</button>
  </div>
</template>

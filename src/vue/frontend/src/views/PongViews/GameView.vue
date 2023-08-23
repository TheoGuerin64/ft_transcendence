<script setup lang="ts">
import { state } from '../../socket'
import { playerStatus } from '../../store'
</script>

<template>
  <div
    v-if="state.gameParam.status === playerStatus.GAME"
    class="column is-flex is-half is-offset-one-quarter is-justify-content-space-between"
  >
    <p>Player One: {{ state.gameParam.scorePlayerOne }}</p>
    <p>Player Two: {{ state.gameParam.scorePlayerTwo }}</p>
  </div>
</template>

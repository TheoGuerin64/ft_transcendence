<script setup lang="ts">
import { state } from '../../socket'
import { playerStatus } from '../../store'
</script>
<script lang="ts">
export default {
  methods: {
    emitleftQueue() {
      this.$emit('leftQueue')
    }
  }
}
</script>

<template>
  <div v-if="state.gameParam.status === playerStatus.QUEUE">
    <p>currently in queue, please wait</p>
    <div class="lds-dual-ring"></div>
    <div>
      <button @click="emitleftQueue" class="button mt-3 is-light">left queue</button>
    </div>
  </div>
</template>

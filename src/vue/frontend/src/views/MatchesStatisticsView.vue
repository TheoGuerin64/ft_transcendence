<script setup lang="ts">
import { store } from '../store'
import type { Match, User } from '../interface'
import axios, { type AxiosResponse } from 'axios'
</script>

<script lang="ts">
interface statistics {
  nbWin: number
  nbLose: number
  winRate: number
  elo: number
  ladder: number
}
export default {
  data() {
    return {
      store,
      userStats: {} as statistics
    }
  },
  props: {
    Matches: { type: Object as () => Match[] }
  },

  mounted() {
    this.findPlayerStat()
  },
  methods: {
    findPlayerStat() {
      axios
        .get('http://127.0.0.1:3000/MatchStatistics', {
          withCredentials: true
        })
        .then((response) => {
          this.parseData(response)
        })
    },
    parseData(response: AxiosResponse) {
      this.userStats = {
        nbWin: response.data.nbWin,
        nbLose: response.data.nbLose,
        winRate: response.data.winRate,
        elo: response.data.elo,
        ladder: response.data.ladder
      }
    }
  }
}
</script>
<template>
  <p>
    win : {{ userStats.nbWin }} | lose : {{ userStats.nbLose }} | winrate: {{ userStats.winRate }}%
  </p>
  <p>elo : {{ userStats.elo }}</p>
  <p v-if="userStats.ladder !== -1">rank :{{ userStats.ladder }}</p>
  <p v-else>rank : unranked</p>
</template>
<style>
@import 'https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css';
</style>

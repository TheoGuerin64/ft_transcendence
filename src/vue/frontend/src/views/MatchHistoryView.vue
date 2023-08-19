<script setup lang="ts">
import axios, { type AxiosResponse } from 'axios'
import MatchPlayed from './MatchPlayedView.vue'
import MatchesStatistics from './MatchesStatisticsView.vue'
import type { Match, User } from '../interface'
</script>
<script lang="ts">
export interface statistics {
  nbWin: number
  nbLose: number
  winRate: number
  elo: number
  ladder: number
}
export default {
  data() {
    return {
      userStats: {} as statistics,
      axiosEnded: false
    }
  },
  mounted() {
    this.findPlayerStat()
  },
  methods: {
    findPlayerStat() {
      this.axiosEnded = false
      axios
        .get('http://127.0.0.1:3000/MatchStatistics', {
          withCredentials: true
        })
        .then((response) => {
          this.parseData(response)
          this.axiosEnded = true
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
  <routerLink to="/">Home</routerLink> |
  <routerLink to="/Game">Game</routerLink>
  <h1 class="title is-1 has-text-centered">Match History</h1>
  <div v-if="axiosEnded && userStats.ladder !== -1">
    <MatchesStatistics :userStats="userStats" />
    <div id="history">
      <MatchPlayed />
    </div>
  </div>
  <div v-else><p>no match played for the moment</p></div>
</template>

<style>
#history {
  height: 60vh;
  overflow: auto;
}
</style>

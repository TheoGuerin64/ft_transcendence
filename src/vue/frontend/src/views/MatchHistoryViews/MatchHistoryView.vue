<script setup lang="ts">
import axios, { type AxiosResponse } from 'axios'
import MatchPlayed from './MatchPlayedView.vue'
import MatchesStatistics from './MatchStatisticsView.vue'
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
      userStats: {} as statistics
    }
  },
  async mounted() {
    await this.findPlayerStat()
  },
  methods: {
    /**
     * make a request to the back to get all players stats
     */
    async findPlayerStat() {
      await axios
        .get('http://127.0.0.1:3000/MatchStatistics', {
          withCredentials: true
        })
        .then((response) => {
          this.parseData(response)
        })
        .catch((error) => {
          console.log(error)
        })
    },
    /**
     * parse the response
     * @param response axios response
     */
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
  <h1 class="title is-1 has-text-centered mt-4">Match History</h1>
  <div v-if="userStats.ladder !== -1">
    <MatchesStatistics :userStats="userStats" />
    <div id="history">
      <MatchPlayed />
    </div>
  </div>
  <div v-else class="ml-3"><p>No matches played at the moment bozo</p></div>
</template>

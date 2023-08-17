<script setup lang="ts">
import axios, { type AxiosResponse } from 'axios'
import MatchPlayedBluePrint from './MatchPlayedBluePrint.vue'
import MatchesStatistics from './MatchesStatisticsView.vue'
import type { Match, User } from '../interface'
</script>
<script lang="ts">
export default {
  data() {
    return {
      matches: [] as Match[],
      findMatches: false
    }
  },
  created() {
    this.findMatchPlayed()
  },
  methods: {
    findMatchPlayed() {
      this.findMatches = false
      axios
        .get('http://127.0.0.1:3000/MatchHistory', {
          withCredentials: true
        })
        .then((response) => {
          this.parseResponse(response)
          this.findMatches = true
        })
    },

    parseResponse(response: AxiosResponse) {
      for (let x = 0; x < response.data.length; x++) {
        const match = {} as Match
        match.result = response.data[x].result
        match.users = []
        match.id = response.data[x].id
        const userOne = {} as User
        userOne.login = response.data[x].users[0].login
        userOne.avatar = response.data[x].users[0].avatar
        match.users.push(userOne)
        const userTwo = {} as User
        userTwo.login = response.data[x].users[1].login
        userTwo.avatar = response.data[x].users[1].avatar
        match.users.push(userTwo)
        this.matches.push(match)
      }
    }
  }
}
</script>
<template>
  <routerLink to="/">Home</routerLink> |
  <routerLink to="/Game">Game</routerLink>
  <p>Match History</p>

  <div v-if="findMatches" id="history">
    <MatchesStatistics :Matches="matches" />
    <MatchPlayedBluePrint :Matches="matches" />
  </div>
</template>

<style>
#history {
  height: 85vh;
  overflow: auto;
}
</style>

<script setup lang="ts">
import { store } from '../store'
import type { Match, User } from '../interface'
</script>

<script lang="ts">
export default {
  data() {
    return {
      store,
      nbWin: 0,
      nbLose: 0,
      percentageWin: 0,
      elo: 50
    }
  },
  props: {
    Matches: { type: Object as () => Match[] }
  },

  mounted() {
    this.parseData()
  },
  methods: {
    parseData() {
      this.calculateWinLose()
    },
    calculateWinLose() {
      if (this.Matches === undefined) {
        return
      }
      for (const match of this.Matches) {
        let player = this.findPlayer(match)
        if (this.userWon(match, player)) {
          this.nbWin++
        } else {
          this.nbLose++
        }
        let secondPlayer
        if (player == 0) {
          secondPlayer = 1
        } else {
          secondPlayer = 0
        }
        this.elo += match.result[player] - match.result[secondPlayer]
      }
      this.percentageWin = Math.round((this.nbWin / (this.nbWin + this.nbLose)) * 100)
    },
    findPlayer(match: Match): number {
      if (this.store.user?.name === match.users[0].login?.trimEnd()) {
        return 0
      } else {
        return 1
      }
    },
    userWon(match: Match, player: number): boolean {
      if (match.result[player] === 5) {
        return true
      } else {
        return false
      }
    }
  }
}
</script>
<template>
  <p>
    Win : {{ nbWin }}, Lose : {{ nbLose }}, percentage of win : {{ percentageWin }}%, elo
    {{ elo }}
  </p>
</template>
<style>
@import 'https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css';
</style>

<script setup lang="ts">
import type { statistics } from './MatchHistoryView.vue'
</script>

<script lang="ts">
export default {
  data() {
    return {}
  },
  props: {
    userStats: { type: Object as () => statistics }
  },

  mounted() {
    this.updatePiechart()
  },
  methods: {
    updatePiechart() {
      const piechart = document.getElementById('piechart')
      if (piechart === null || this.userStats === undefined) {
        return
      }
      const greenPartPercentage = Math.round(this.userStats.winRate * 3.6)
      const newBackground =
        'conic-gradient(green ' +
        greenPartPercentage.toString() +
        'deg, red 0 ' +
        (360 - greenPartPercentage).toString() +
        'deg)'
      piechart.style.backgroundImage = newBackground
    }
  }
}
</script>
<template>
  <div class="box has-text-centered is-size-3">
    <div>
      <div id="piechart"></div>
      <p>
        win : {{ userStats?.nbWin }} | lose : {{ userStats?.nbLose }} | winrate:
        {{ userStats?.winRate }}%
      </p>

      <p>elo : {{ userStats?.elo }}</p>
      <p>rank : {{ userStats?.ladder }}</p>
    </div>
  </div>
</template>
<style>
@import 'https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css';
#piechart {
  margin-left: 7vw;
  margin-top: 5vh;
  display: block;
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
}

#piechart {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

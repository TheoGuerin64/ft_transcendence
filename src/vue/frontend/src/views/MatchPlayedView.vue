<script setup lang="ts">
import { store } from '../store'
import UserAvatar from '@/components/UserAvatar.vue'
import type { Match, User } from '../interface'
import axios, { type AxiosResponse } from 'axios'
</script>

<script lang="ts">
export default {
  data() {
    return {
      store,
      Matches: [] as Match[]
    }
  },
  async created() {
    await this.findMatchPlayed()
  },
  methods: {
    userWon(match: Match): string {
      if (
        (this.store.user?.name === match.users[0].login?.trimEnd() && match.result[0] === 5) ||
        (this.store.user?.name === match.users[1].login?.trimEnd() && match.result[1] === 5)
      ) {
        return 'box column is-flex is-three-fifths is-offset-one-fifth is-justify-content-space-between has-background-success'
      } else {
        return 'box column is-flex is-three-fifths is-offset-one-fifth is-justify-content-space-between has-background-danger'
      }
    },
    async findMatchPlayed() {
      await axios
        .get('http://127.0.0.1:3000/MatchHistory', {
          withCredentials: true
        })
        .then((response) => {
          this.parseResponse(response)
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
        this.Matches.push(match)
      }
    }
  }
}
</script>
<template>
  <div :class="userWon(match)" v-for="match in Matches" :key="match.id">
    <div>
      <UserAvatar :size="128" :image="match.users[0].avatar" />
      <div class="is-size-4 has-text-centered">
        {{ match.users[0].login }}
      </div>
    </div>
    <div class="is-size-2 pt-5 mt-5">
      <p>{{ match.result[0] }} - {{ match.result[1] }}</p>
    </div>
    <div>
      <UserAvatar :size="128" :image="match.users[1].avatar" />
      <div class="is-size-4 has-text-centered">
        {{ match.users[0].login }}
      </div>
    </div>
  </div>
</template>
<style>
@import 'https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css';
</style>

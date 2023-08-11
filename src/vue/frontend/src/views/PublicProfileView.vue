<script setup lang="ts">
import axios from 'axios'
import { useStore, type UserType } from '../store'
import UserAvatar from '@/components/UserAvatar.vue'
</script>

<script lang="ts">
export default {
  data() {
    return {
      store: useStore,
      publicUser: null as Partial<UserType> | null,
      isFriend: false
    }
  },

  async mounted() {
    // Get user informations
    let response
    try {
      response = await axios.post(
        'http://127.0.0.1:3000/user/public',
        { login: this.$route.params.login },
        { withCredentials: true }
      )
    } catch (error: any) {
      if (
        axios.isAxiosError(error) &&
        error.response &&
        (error.response.status === 400 ||
          error.response.status === 500 ||
          error.response.status === 401)
      ) {
        this.$notify({
          text: error.response.data.message,
          type: 'error'
        })
        return
      } else {
        throw error
      }
    }
    this.publicUser = response.data

    // Check if user is friend
    if (this.store.user!.login != this.$route.params.login) {
      response = await axios.post(
        'http://127.0.0.1:3000/user/friends/isFriend',
        { login: this.$route.params.login },
        { withCredentials: true }
      )
      this.isFriend = response.data
    }
  },

  methods: {
    /**
     * Add friend request
     */
    async addFriend(): Promise<void> {
      try {
        await axios.post(
          'http://127.0.0.1:3000/user/friends',
          { login: this.publicUser!.login },
          { withCredentials: true }
        )
      } catch (error) {
        if (axios.isAxiosError(error) && error.response && error.response.status == 400) {
          this.$notify({
            type: 'error',
            text: error.response.data.message
          })
          return
        }
      }
      this.isFriend = true
    }
  }
}
</script>

<template>
  <main>
    <div class="columns is-centered mt-1" v-if="publicUser">
      <div class="column is-half">
        <h1 class="title is-size-1-desktop has-text-dark">{{ publicUser.name }}</h1>
        <div class="box">
          <UserAvatar :image="publicUser.avatar" :size="400" />
          <button
            class="button is-primary is-fullwidth mt-1"
            v-if="!isFriend && publicUser.login !== store.user!.login"
            @click="addFriend"
          >
            Add friend
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

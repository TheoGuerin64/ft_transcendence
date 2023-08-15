<script setup lang="ts">
import axios from 'axios'
import { useStore, type UserPublic, UserStatus } from '../store'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import UserAvatar from '@/components/UserAvatar.vue'
</script>

<script lang="ts">
/**
 * Public profile page
 */
export default {
  data() {
    return {
      store: useStore,
      publicUser: null as Partial<UserPublic> | null,
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

    // Check if user is self
    if (this.store.user!.login == this.publicUser!.login) {
      this.$router.push('/profile')
      return
    }

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

  computed: {
    /**
     * Get color of connection status
     */
    connectionColor(): string {
      if (this.publicUser!.status == UserStatus.ONLINE) {
        return '#33d17a'
      } else if (this.publicUser!.status == UserStatus.OFFLINE) {
        return '#ff3860'
      } else if (this.publicUser!.status == UserStatus.PLAYING) {
        return '#ffdd57'
      } else {
        return '#000000'
      }
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
    },

    /**
     * Remove friend request
     */
    async removeFriend(): Promise<void> {
      try {
        await axios.post(
          'http://127.0.0.1:3000/user/friends/remove',
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
      this.isFriend = false
    }
  }
}
</script>

<template>
  <main>
    <div class="is-flex is-flex-direction-column is-align-items-center mt-1" v-if="publicUser">
      <div class="box">
        <UserAvatar :image="publicUser.avatar" :size="400" />
        <div>
          <h1 class="is-size-3 has-text-weight-bold">{{ publicUser.name }}</h1>
          <p class="is-size-4">{{ publicUser.login }}</p>
          <p class="is-size-5" :style="'color: ' + connectionColor">
            <FontAwesomeIcon :icon="['far', 'circle-dot']" />{{ ' ' + publicUser.status }}
          </p>
        </div>
        <button class="button is-primary is-fullwidth mt-1" v-if="!isFriend" @click="addFriend">
          Add friend
        </button>
        <button class="button is-danger is-fullwidth mt-1" v-else @click="removeFriend">
          Remove friend
        </button>
      </div>
    </div>
  </main>
</template>

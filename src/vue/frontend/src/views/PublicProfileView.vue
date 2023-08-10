<script setup lang="ts">
import axios from 'axios'
import type { UserType } from '../store'
import UserAvatar from '@/components/UserAvatar.vue'
</script>

<script lang="ts">
export default {
  data() {
    return {
      publicUser: null as Partial<UserType> | null
    }
  },

  async mounted() {
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
    console.log(this.publicUser)
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
        </div>
      </div>
    </div>
  </main>
</template>

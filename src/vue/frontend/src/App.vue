<script setup lang="ts">
import axios from 'axios'
import { store } from './store'
import { RouterView } from 'vue-router'
</script>

<script lang="ts">
export default {
  data() {
    return {
      store
    }
  },

  mounted() {
    axios
      .get('http://127.0.0.1:3000/user/me', {
        withCredentials: true
      })
      .then((response) => {
        this.store.setUser(response.data)
      })
      .catch(() => {})
  }
}
</script>

<template>
  <RouterView />
</template>

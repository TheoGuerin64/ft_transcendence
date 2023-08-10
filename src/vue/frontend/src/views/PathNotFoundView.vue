<script lang="ts">
/**
 * Page not found view (redirect to the home page after 5 seconds)
 */
export default {
  data() {
    return {
      timerCount: 5
    }
  },

  watch: {
    /**
     * Redirect to the home page after the timer ends
     */
    timerCount: {
      handler(value) {
        if (value > 0) {
          setTimeout(() => {
            this.timerCount--
          }, 1000)
        } else {
          this.$router.push('/')
        }
      },
      immediate: true
    }
  }
}
</script>

<template>
  <main>
    <div class="mt-3 ml-4">
      <h1 class="title is-size-1-desktop has-text-dark">Page not found</h1>
      <h2 class="subtitle is-size-4-desktop has-text-grey">
        You will be redirected to the home page in {{ timerCount }} seconds
      </h2>
    </div>
  </main>
</template>

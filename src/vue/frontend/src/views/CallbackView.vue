<script setup lang="ts">
import axios from 'axios'
import { useStore } from '../store'
</script>

<script lang="ts">
/**
 * View for the OAuth2 callback (redirected from the api)
 */
export default {
  data() {
    return {
      store: useStore,
      encryptedLogin: undefined as string | undefined
    }
  },

  async mounted() {
    const code = this.$route.query.code
    this.removeQueryCode()

    // check if user is already signed in or if no code is provided
    if (this.store.user || !code) {
      await this.$router.push('/')
      return
    }

    // get encrypted login and if 2FA is enabled
    let response
    try {
      response = await axios.get('http://127.0.0.1:3000/auth/sign-in?code=' + code)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response && error.response.status == 500) {
        await this.$router.push('/')
        return
      } else {
        throw error
      }
    }

    if (!response.data.twofa) {
      this.signIn(response.data.encryptedLogin, null)
    } else {
      this.encryptedLogin = response.data.encryptedLogin
    }
  },

  unmounted() {
    if (this.store.user) return

    this.store.setConnecting(false)
    this.$notify({
      type: 'error',
      text: 'Sign in aborted'
    })
  },

  methods: {
    /**
     * Sign in to the application
     * @param encryptedLogin base64 encrypted login
     * @param twofaToken 2FA token
     */
    async signIn(encryptedLogin: string, twofaToken: string | null): Promise<void> {
      const submit = this.$refs.submit as HTMLInputElement

      submit?.classList.add('is-loading')

      // verify 2FA token and get cookie token
      try {
        await axios.post(
          'http://127.0.0.1:3000/auth/verify',
          { encrypted_login: encryptedLogin, twofa_token: twofaToken },
          { withCredentials: true }
        )
      } catch (error: any) {
        if (
          axios.isAxiosError(error) &&
          error.response &&
          (error.response.status == 400 || error.response.status == 401)
        ) {
          this.$notify({
            type: 'error',
            text: Array.isArray(error.response.data.message)
              ? error.response.data.message[0]
              : error.response.data.message
          })
          submit?.classList.remove('is-loading')
          submit?.classList.add('is-danger')
          return
        } else {
          throw error
        }
      }

      // get user
      const user = await axios.get('http://127.0.0.1:3000/user', {
        withCredentials: true
      })
      this.store.setUser(user.data)
      console.log('User:', user.data)

      submit?.classList.remove('is-danger')
      submit?.classList.remove('is-loading')

      // redirect to home
      this.store.setConnecting(false)
      await this.$router.push('/')
    },

    /**
     * Submit 2FA token
     */
    async onsubmit(event: Event) {
      event.preventDefault()
      const form = event.target as HTMLFormElement
      const input = form.twofaToken as HTMLInputElement
      await this.signIn(this.encryptedLogin!, input.value)
    },

    /**
     * Remove code from query without reloading the page
     */
    removeQueryCode() {
      const query = Object.assign({}, this.$route.query) // shallow copy
      delete query.code
      this.$router.replace({ query: query })
    }
  }
}
</script>

<template>
  <main>
    <div class="columns is-centered mt-5" v-if="encryptedLogin">
      <div class="column is-two-fifths">
        <div class="box">
          <form @submit="onsubmit">
            <label class="label" for="twofaToken">2FA Code</label>
            <div class="control">
              <input
                id="twofaToken"
                name="twofaToken"
                class="input"
                type="text"
                placeholder="123456"
                minlength="6"
                maxlength="6"
                autocomplete="off"
                autofocus
                oninput="this.value = this.value.replace(/[^0-9]/g, '');"
              />
            </div>
            <div class="control mt-5">
              <button class="button is-primary" type="submit" ref="submit">Submit</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </main>
</template>

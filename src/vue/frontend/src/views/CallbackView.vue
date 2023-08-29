<script setup lang="ts">
import axios from 'axios'
import { socketConnect } from '../socket'
import { useStore } from '../store'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import UserAvatar from '@/components/UserAvatar.vue'
</script>

<script lang="ts">
/**
 * View for the OAuth2 callback (redirected from the api)
 */
export default {
  data() {
    return {
      store: useStore,
      encryptedLogin: undefined as string | undefined,
      twoFA: false,
      firstTime: false,
      uploadHover: false,
      newAvatar: undefined as string | undefined,
      nameInput: '' as string
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

    if (response.data.twofa) {
      this.encryptedLogin = response.data.encryptedLogin
      this.twoFA = true
    } else if (response.data.firstTime) {
      this.encryptedLogin = response.data.encryptedLogin
      this.firstTime = true
    } else {
      this.signIn(response.data.encryptedLogin, null)
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
      socketConnect()

      // get user
      const user = await axios.get('http://127.0.0.1:3000/user', {
        withCredentials: true
      })
      this.store.setUser(user.data)

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
    },

    /**
     * Update avatar preview
     */
    updateAvatar(event: Event) {
      const input = event.target as HTMLInputElement
      if (!input.files) return
      let blob = new Blob([input.files[0]], { type: input.files[0].type })
      let reader = new FileReader()
      reader.readAsDataURL(blob)
      reader.onloadend = () => {
        this.newAvatar = reader.result as string
      }
    },

    /**
     * Update user profile from form
     */
    async updateProfile(event: Event) {
      const form = event.target as HTMLFormElement
      const avatar = form.avatar as HTMLInputElement

      event.preventDefault()

      // Create form data
      const formData = new FormData()
      if (this.nameInput != '') {
        formData.append('name', this.nameInput)
      }
      if (avatar.files && avatar.files.length == 1) {
        formData.append('avatar', avatar.files[0])
      }
      formData.append('encrypted_login', this.encryptedLogin!)
      if (Array.from(formData.keys()).length == 0) return

      const submit = form.querySelector('button[type="submit"]') as HTMLInputElement

      // Send request
      submit.classList.add('is-loading')
      submit.disabled = true
      try {
        const response = await axios.post('http://127.0.0.1:3000/user/set', formData, {
          withCredentials: true
        })
        submit.classList.remove('is-danger')
        this.$notify({
          type: 'success',
          text: 'Profile updated'
        })
      } catch (error: any) {
        if (axios.isAxiosError(error) && error.response && error.response.status == 400) {
          submit.classList.add('is-danger')
          this.$notify({
            type: 'error',
            text: Array.isArray(error.response.data.message)
              ? error.response.data.message[0]
              : error.response.data.message
          })
        } else {
          throw error
        }
      }
      submit.classList.remove('is-loading')
      submit.disabled = false

      this.signIn(this.encryptedLogin!, null)
    }
  }
}
</script>

<template>
  <main>
    <div class="columns is-centered mt-5">
      <div class="column is-two-fifths">
        <div class="box" v-if="firstTime">
          <form class="box" @submit="updateProfile">
            <div class="field">
              <label class="label">Avatar</label>
              <div class="control">
                <UserAvatar :size="256" :image="newAvatar" />
                <div class="file" @change="updateAvatar">
                  <label
                    class="file-label"
                    @mouseover="uploadHover = true"
                    @mouseleave="uploadHover = false"
                  >
                    <input
                      class="file-input"
                      type="file"
                      name="avatar"
                      id="avatar"
                      accept="image/*"
                    />
                    <span class="file-cta">
                      <span class="file-icon">
                        <FontAwesomeIcon icon="fa-solid fa-upload" :bounce="uploadHover" />
                      </span>
                      <span class="file-label"> Choose a image… </span>
                    </span>
                  </label>
                </div>
              </div>
            </div>
            <div class="field">
              <label for="username" class="label">Name</label>
              <div class="control">
                <input
                  class="input"
                  name="username"
                  id="username"
                  type="text"
                  v-model="nameInput"
                  minlength="3"
                  maxlength="16"
                />
              </div>
            </div>
            <div class="field">
              <div class="control">
                <button type="submit" class="button is-primary">Save</button>
                <button class="button is-info ml-2" @click="signIn(encryptedLogin!, null)">
                  Default
                </button>
              </div>
            </div>
          </form>
        </div>
        <div class="box" v-if="twoFA">
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

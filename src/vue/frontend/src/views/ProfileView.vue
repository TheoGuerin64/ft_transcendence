<script setup lang="ts">
import UserAvatar from '@/components/UserAvatar.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import axios from 'axios'
import { useStore } from '../store'
</script>

<script lang="ts">
/**
 * Profile view (edit user informations)
 */
export default {
  data() {
    return {
      store: useStore,
      uploadHover: false,
      newAvatar: undefined as string | undefined,
      nameInput: '' as string,
      qrCode: undefined as string | undefined
    }
  },

  methods: {
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
      if (this.nameInput != this.store.user!.name) {
        formData.append('name', this.nameInput)
      }
      if (avatar.files && avatar.files.length == 1) {
        formData.append('avatar', avatar.files[0])
      }
      if (Array.from(formData.keys()).length == 0) return

      const submit = form.querySelector('button[type="submit"]') as HTMLInputElement

      // Send request
      submit.classList.add('is-loading')
      submit.disabled = true
      try {
        const response = await axios.post('http://127.0.0.1:3000/user', formData, {
          withCredentials: true
        })
        this.store.updateUser(response.data)
        submit.classList.remove('is-danger')
        this.$notify({
          type: 'success',
          text: 'Profile updated'
        })
      } catch (error: any) {
        if (axios.isAxiosError(error) && error.response && error.response.status == 400) {
          console.log(error.response.data.statusCode)
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
    },

    /**
     * Switch 2FA status
     */
    async switch2fa() {
      const switch2fa = this.$refs.switch2fa as HTMLInputElement

      switch2fa.classList.add('is-loading')
      if (this.store.user!.is2faEnabled) {
        await axios.post('http://127.0.0.1:3000/auth/2fa/delete', {}, { withCredentials: true })
        this.qrCode = undefined
        this.store.updateUser({ is2faEnabled: false })
        this.$notify({
          type: 'success',
          text: '2FA disabled'
        })
      } else {
        const response = await axios.post(
          'http://127.0.0.1:3000/auth/2fa/enable',
          {},
          { withCredentials: true }
        )
        this.qrCode = response.data
        this.store.updateUser({ is2faEnabled: true })
        this.$notify({
          type: 'success',
          text: '2FA enabled'
        })
      }
      switch2fa.classList.remove('is-loading')
    }
  },

  mounted() {
    this.nameInput = this.store.user!.name
  }
}
</script>

<template>
  <main>
    <div class="columns is-centered mt-1">
      <div class="column is-half">
        <h1 class="title is-size-1-desktop has-text-dark">Profile</h1>
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
            <label for="login" class="label">Login</label>
            <div class="control">
              <input
                class="input"
                name="login"
                id="login"
                type="text"
                :value="store.user!.login"
                disabled
              />
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
            </div>
          </div>
        </form>
        <div class="box">
          <div class="is-flex">
            <div class="is-flex is-flex-direction-column">
              <img v-if="qrCode" class="box p-1" :src="qrCode" />
              <button class="button is-primary is-fullwidth" @click="switch2fa" ref="switch2fa">
                {{ store.user!.is2faEnabled ? 'Disable' : 'Enable' }} two-factor authentication
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

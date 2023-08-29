<script setup lang="ts">
import ChannelComponent from '@/components/Channel.vue'
import { type Channel } from '@/components/Channel.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useStore } from '../store'
import { socket, state } from '@/socket'
import axios from 'axios'
</script>

<script lang="ts">
export default {
  data() {
    return {
      store: useStore,
      state: state,
      showDialog: false as boolean,
      protectedDialog: false as boolean,
      placeholder: 'Public Channel Name' as string,
      channelData: {
        name: '' as string,
        isPublic: true as boolean,
        isProtected: false as boolean,
        password: '' as string
      },
      password: '' as string,
      Channels: [] as Channel[],
      ChannelsDM: [] as Channel[],
      id: 0 as number
    }
  },
  methods: {
    createChannel(): void {
      if (this.channelData.isPublic && this.channelData.password) {
        this.$notify({
          text: 'Public channels cannot have passwords',
          type: 'warn'
        })
        return
      } else if (
        !this.channelData.isPublic &&
        !this.channelData.isProtected &&
        this.channelData.password
      ) {
        this.$notify({
          text: 'Private channels cannot have a password',
          type: 'warn'
        })
        return
      }
      if (this.channelData.isProtected && this.channelData.password === '') {
        this.$notify({
          text: 'Protected channels require a password',
          type: 'warn'
        })
        return
      }
      socket.emit('create-channel', this.channelData)
      this.password = ''
    },
    submitPassword(): void {
      this.protectedDialog = false
      this.channelData.password = this.password
      this.channelData.isProtected = true
      this.channelData.isPublic = false
    },
    async getChannels(): Promise<void> {
      try {
        const response = await axios.get('http://127.0.0.1:3000/channel', {
          withCredentials: true
        })
        for (let i = 0; i < response.data.length; i++) {
          this.Channels.push(response.data[i])
        }
      } catch (error) {
        console.log(error)
      }
    },
    async getChannelsDM(): Promise<void> {
      try {
        const response = await axios.get('http://127.0.0.1:3000/channel/dm', {
          withCredentials: true
        })
        for (let i = 0; i < response.data.length; i++) {
          this.ChannelsDM.push(response.data[i])
        }
      } catch (error) {
        console.log(error)
      }
    }
  },
  async mounted() {
    await this.getChannels()
    await this.getChannelsDM()
  }
}
</script>

<template>
  <div v-if="!showDialog">
    <div class="columns is-centered mt-6">
      <nav class="panel column is-10 channelPanel">
        <p class="panel-heading">Channels</p>
        <div v-for="channel in Channels" :key="channel.id">
          <ChannelComponent :channel="channel" />
        </div>
      </nav>
    </div>
    <div class="columns is-centered mt-6">
      <button class="button mt-3 is-link is-outlined" @click="showDialog = !showDialog">
        Create Channel
      </button>
    </div>
    <div class="columns is-centered mt-6">
      <nav class="panel column is-10 channelPanel">
        <p class="panel-heading">DMS</p>
        <div v-for="channel in ChannelsDM" :key="channel.id">
          <ChannelComponent :channel="channel" />
        </div>
      </nav>
    </div>
  </div>
  <div v-if="showDialog" class="dialogBox">
    <div class="inputChannel">
      <input class="input new-channel" v-model="channelData.name" :placeholder="placeholder" />
      <button class="button is-success ml-1" @click="createChannel">
        <FontAwesomeIcon :icon="['far', 'square-plus']" size="lg" />
      </button>
      <button
        class="button is-info ml-2"
        @click="
          ((channelData.isPublic = true), (channelData.isProtected = false)),
            (placeholder = 'Public Channel Name')
        "
      >
        Public
      </button>
      <button
        v-if="!protectedDialog"
        class="button is-info ml-2"
        @click="
          ((protectedDialog = !protectedDialog),
          (channelData.isProtected = true),
          (channelData.isPublic = false)),
            (placeholder = 'Protected Channel Name')
        "
      >
        Protected
      </button>
      <div v-if="protectedDialog" class="passwordInput">
        <form @submit="submitPassword">
          <input class="input" v-model="password" placeholder="********" type="password" />
        </form>
        <button class="button is-warning ml-1" @click="submitPassword">
          <FontAwesomeIcon :icon="['fas', 'fingerprint']" />
        </button>
      </div>
      <button
        class="button is-info ml-2"
        @click="
          ((channelData.isPublic = false), (channelData.isProtected = false)),
            (placeholder = 'Private Channel Name')
        "
      >
        Private
      </button>
    </div>
  </div>
</template>

<style>
.inputChannel {
  display: flex;
  margin-top: 30px;
  margin-left: 30px;
  width: 60%;
}

.passwordInput {
  margin-left: 0.5%;
  display: flex;
  width: 30%;
}

.new-channel {
  width: 80%;
}
</style>

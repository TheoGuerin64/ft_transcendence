<script setup lang="ts">
import Channel from '../components/Channel.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useStore } from '../store'
import { socket, state } from '@/socket'
import axios from 'axios'
</script>

<script lang="ts">
interface Channel {
  id: number
  name: string
  isPublic: boolean
  isProtected: boolean
}

export default {
  data() {
    return {
      store: useStore,
      state: state,
      showDialog: false,
      channelData: {
        name: '' as string | undefined
      },
      Channels: [] as Channel[],
      axiosEnded: false,
      id: 0 as number
    }
  },
  methods: {
    joinChannel(channelName: string): void {
      console.log('Joining channel: ' + channelName)
      this.state.Messages = []
      socket.emit('join-channel', channelName)
      this.$router.push('/chat/' + channelName)
    },
    createChannel(): void {
      socket.emit('create-channel', this.channelData)
      this.showDialog = false
    },
    async getChannels(): Promise<void> {
      this.axiosEnded = false
      try {
        const response = await axios.get('http://127.0.0.1:3000/channels', {
          withCredentials: true
        })
        for (let i = 0; i < response.data.length; i++) {
          this.Channels.push(response.data[i])
        }
        this.axiosEnded = true
      } catch (error) {
        console.log(error)
      }
    }
  },
  async mounted() {
    await this.getChannels()
  }
}
</script>

<template>
  <div v-if="!showDialog">
    <button class="button mt-3 is-link is-outlined" @click="showDialog = !showDialog">
      Create Channel
    </button>
  </div>
  <nav v-if="!showDialog" class="panel">
    <p class="panel-heading">Channels</p>
    <p class="panel-tabs">
      <a class="is-active">All</a>
      <a>Public</a>
      <a>Protected</a>
      <a>Private</a>
    </p>
    <li v-for="channel in Channels" :key="channel.id">
      <a @click="joinChannel(channel.name)" class="panel-block">
        <span class="panel-icon">
          <i class="fa-solid fa-hashtag" aria-hidden="true"></i>
        </span>
        {{ channel.name }}
        <!-- <Channel
          :name="channel.name"
          :isPublic="channel.isPublic"
          :isProtected="channel.isProtected"
        /> -->
      </a>
    </li>
  </nav>
  <div v-if="showDialog" id="dialogBox">
    <div id="inputChannel">
      <form @submit="createChannel">
        <input class="input" v-model="channelData.name" placeholder="Channel name" />
      </form>
      <button id="submitButton" class="button is-success" @click="createChannel">
        <FontAwesomeIcon :icon="['far', 'square-plus']" size="lg" />
      </button>
    </div>
  </div>
</template>

<style>
#inputChannel,
#sendChannel {
  display: flex;
  margin-top: 30px;
  margin-left: 30px;
}

#submitButton {
  margin-left: 0.5%;
}

#createChannel {
  margin-left: 30px;
  margin-top: 20px;
}
</style>

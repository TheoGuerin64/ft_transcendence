<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useStore } from '../store'
import { socket, state } from '@/socket'
import axios from 'axios'
import { setRouterInstance } from '@/socket'
</script>

<script lang="ts">
interface Channel {
  id: number
  name: string
  isPublic: boolean
  isProtected: boolean
  promptPassword: boolean
}

export default {
  data() {
    return {
      store: useStore,
      state: state,
      showDialog: false as boolean,
      protectedDialog: false as boolean,
      showContextMenu: false as boolean,
      placeholder: 'Public Channel Name' as string,
      channelData: {
        name: '' as string | undefined,
        isPublic: true as boolean,
        isProtected: false as boolean,
        password: '' as string | undefined
      },
      Channels: [] as Channel[],
      password: '' as string,
      id: 0 as number
    }
  },
  methods: {
    handleContextMenu(e: any): void {
      e.preventDefault()
      const menu = document.createElement('div')
      document.appendChild(menu)
      this.showContextMenu = true
      console.log('x', e.clientX)
      console.log('y', e.clientY)
    },
    submitPassword(): void {
      this.protectedDialog = false
      this.channelData.password = this.password
      this.channelData.isProtected = true
      this.channelData.isPublic = false
    },
    joinChannel(channel: Channel): void {
      this.channelData.name = channel.name
      this.channelData.isPublic = channel.isPublic
      this.channelData.isProtected = channel.isProtected
      this.channelData.password = this.password
      socket.emit('join-channel', this.channelData)
    },
    createChannel(): void {
      socket.emit('create-channel', this.channelData)
      this.showDialog = false
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
    }
  },
  async mounted() {
    setRouterInstance(this.$router)
    await this.getChannels()
  }
}
</script>

<template>
  <div v-if="!showDialog">
    <div class="columns is-centered mt-6">
      <nav class="panel column is-10" id="channelPanel">
        <p class="panel-heading">Channels</p>
        <div v-for="channel in Channels" :key="channel.id">
          <div v-if="channel.isProtected" id="protectedDialog">
            <a class="panel-block" @contextmenu="handleContextMenu($event)">
              <div v-if="showContextMenu"></div>
              <!-- <ChannelContextMenu :display="showContextMenu" ref="menu">
                <ul>
                  <li>Manage channel</li>
                  <li>Join channel</li>
                  <li>Leave channel</li>
                </ul>
              </ChannelContextMenu> -->
              <span class="panel-icon">
                <FontAwesomeIcon :icon="['fas', 'key']" />
              </span>
              {{ channel.name }}
            </a>
            <button
              v-if="!channel.promptPassword"
              class="button is-info ml-3"
              id="protectedButton"
              @click="channel.promptPassword = !channel.promptPassword"
            >
              Join
            </button>
            <div id="passwordInput">
              <input
                v-if="channel.promptPassword"
                class="input"
                v-model="password"
                placeholder="********"
                type="password"
              />
              <button
                v-if="channel.promptPassword"
                class="button is-success ml-1"
                @click="joinChannel(channel)"
              >
                <FontAwesomeIcon :icon="['fas', 'paper-plane']" />
              </button>
            </div>
          </div>
          <a v-if="!channel.isProtected" @click="joinChannel(channel)" class="panel-block">
            <span v-if="channel.isPublic" class="panel-icon">
              <FontAwesomeIcon :icon="['fas', 'hashtag']" />
            </span>
            <span v-else class="panel-icon">
              <FontAwesomeIcon :icon="['fas', 'lock']" />
            </span>
            {{ channel.name }}
          </a>
        </div>
      </nav>
    </div>
    <div class="columns is-centered mt-6">
      <button class="button mt-3 is-link is-outlined" @click="showDialog = !showDialog">
        Create Channel
      </button>
    </div>
  </div>
  <div v-if="showDialog" id="dialogBox">
    <div id="inputChannel">
      <form @submit="createChannel">
        <input class="input" v-model="channelData.name" :placeholder="placeholder" />
      </form>
      <button class="button is-success ml-1" @click="createChannel">
        <FontAwesomeIcon :icon="['far', 'square-plus']" size="lg" />
      </button>
      <button
        class="button is-info ml-2"
        @click="(channelData.isPublic = true), (placeholder = 'Public Channel Name')"
      >
        Public
      </button>
      <button
        v-if="!protectedDialog"
        class="button is-info ml-2"
        @click="(protectedDialog = !protectedDialog), (placeholder = 'Protected Channel Name')"
      >
        Protected
      </button>
      <div v-if="protectedDialog" id="passwordInput">
        <input class="input" v-model="password" placeholder="********" type="password" />
        <button class="button is-warning ml-1" @click="submitPassword">
          <FontAwesomeIcon :icon="['fas', 'paper-plane']" />
        </button>
      </div>
      <button
        class="button is-info ml-2"
        @click="
          (channelData.isPublic = !channelData.isPublic), (placeholder = 'Private Channel Name')
        "
      >
        Private
      </button>
    </div>
  </div>
</template>

<style>
#inputChannel {
  display: flex;
  margin-top: 30px;
  margin-left: 30px;
}

#passwordInput {
  margin-left: 0.5%;
  display: flex;
  width: 30%;
}

#protectedDialog {
  display: flex;
}
</style>

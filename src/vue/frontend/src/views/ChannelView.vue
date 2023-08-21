<script setup lang="ts">
import { useStore } from '../store'
import Message from '../components/Message.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { state, socket, setRouterInstance } from '@/socket'
import axios from 'axios'
</script>

<script lang="ts">
interface Channel {
  id: number
  name: string
  isPublic: boolean
  isProtected: boolean
}

const messageData = {
  content: '' as string,
  channelName: '' as string | undefined
}

export default {
  components: {
    Message
  },
  data() {
    return {
      store: useStore,
      state: state,
      message: '' as string,
      channel: null as any
    }
  },
  methods: {
    async getChannel(channelName: string): Promise<void> {
      try {
        const response = await axios.get('http://127.0.0.1:3000/channel/' + channelName, {
          withCredentials: true
        })
        this.channel = response.data
      } catch (error) {
        console.log(error)
      }
    },
    async getMessages(channelName: string): Promise<void> {
      try {
        const response = await axios.get('http://127.0.0.1:3000/channel/messages/' + channelName, {
          withCredentials: true
        })
        for (let i = 0; i < response.data.length; i++) {
          this.state.Messages.push({ id: i, data: response.data[i] })
        }
      } catch (error) {
        console.log(error)
      }
    },
    submitNewMessage(event: Event): void {
      if (event) {
        event.preventDefault()
      }
      messageData.content = this.message
      messageData.channelName = this.state.channelName
      socket.emit('message', messageData)
      this.message = ''
    },
    leave(): void {
      const data = { name: this.$route.params.channelId }
      this.$router.push('/chat')
    }
  },
  async mounted() {
    setRouterInstance(this.$router)
    const data = { name: this.$route.params.channelId as string }
    state.Messages = []
    await this.getChannel(data.name)
    socket.emit('reconnect', data)
    await this.getMessages(data.name)
    this.state.channelName = this.$route.params.channelId as string
  }
}
</script>

<template>
  <main>
    <div class="mt-3 ml-4">
      <h1 class="title is-size-1-desktop has-text-dark">Home</h1>
    </div>
    <div id="chatDisplay">
      <ul>
        <li v-for="message in state.Messages" :key="message.id">
          <Message
            :username="message.data.user.name"
            :content="message.data.content"
            :avatar="message.data.user.avatar"
            :login="message.data.user.login"
          />
        </li>
      </ul>
    </div>
    <div id="sendBar">
      <form @submit="submitNewMessage">
        <input class="input" id="inputMessage" v-model="message" />
      </form>
      <button class="button is-success" id="sendMessage" @click="submitNewMessage">
        <FontAwesomeIcon :icon="['fas', 'paper-plane']" />
      </button>
      <button class="button is-danger ml-3" id="leave" @click="leave">Leave</button>
    </div>
  </main>
</template>

<style>
#chatDisplay {
  width: 90%;
  height: 600px;
  border: solid;
  border-radius: 5px;
  margin-right: 5%;
  margin-left: 5%;
  margin-top: 2%;
  overflow: auto;
  scrollbar-width: auto;
}

#messages {
  margin: 1%;
  padding: 0;
}

#messages li {
  list-style-type: none;
  padding: 1%;
  margin-top: 1%;
}

#sendBar {
  width: 40%;
  display: flex;
  margin-top: 2%;
  margin-left: 6%;
}

#sendMessage {
  margin-left: 2%;
}

#sendChannel {
  margin-left: 2%;
}

#inputChannel {
  border-radius: 5px;
  width: 100%;
  margin-left: 8%;
}
</style>

<script setup lang="ts">
import { useStore } from '../store'
import Message from '../components/Message.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { state, socket } from '@/socket'
</script>

<script lang="ts">
const messageData = {
  content: '' as string,
  username: '' as string | undefined,
  avatar: '' as string | undefined,
  channelName: '' as string | undefined,
  login: '' as string | undefined
}

export default {
  components: {
    Message
  },
  data() {
    return {
      store: useStore,
      state: state,
      message: '' as string
    }
  },
  async mounted() {
    const data = {
      login: this.store.user!.login,
      channelName: this.$route.params.channelId
    }
    this.state.channelName = this.$route.params.channelId as string
    socket.emit('send-history', data)
  },
  methods: {
    submitNewMessage(event: Event): void {
      if (event) {
        event.preventDefault()
      }
      messageData.content = this.message
      messageData.username = this.store.user!.name
      messageData.avatar = this.store.user!.avatar
      messageData.channelName = this.state.channelName
      messageData.login = this.store.user!.login
      try {
        socket.emit('message', messageData)
      } catch (error) {
        console.log(error)
      }
      this.message = ''
    }
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
            :username="message.data.username"
            :content="message.data.content"
            :avatar="message.data.avatar"
            :login="message.data.login"
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
    </div>
  </main>
</template>

<style>
#chatDisplay {
  width: 90%;
  height: 600px;
  border: solid;
  border-radius: 15px;
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

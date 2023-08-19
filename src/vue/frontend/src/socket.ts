import { getCookie } from './utils'
import { io } from 'socket.io-client'
import { notify } from '@kyvg/vue3-notification'
import { reactive } from 'vue'

export const state = reactive({
  connected: false,
  Messages: [] as Array<{
    id: number
    data: any
  }>,
  channelName: '' as string,
  id: 0
})

export const socket = io('http://localhost:3000', {
  autoConnect: false
})

socket.on('connect', () => {
  state.connected = true
})

socket.on('disconnect', () => {
  state.connected = false
})

socket.on('message', (msg: string, username: string, avatar: string, login: string) => {
  state.Messages.push({
    id: state.id++,
    data: {
      content: msg,
      login: login,
      username: username,
      avatar: avatar
    }
  })
})
socket.on('user-joined', (username: string, avatar: string) => {
  state.Messages.push({
    id: state.id++,
    data: {
      content: username + ' has joined the channel ' + state.channelName,
      avatar: avatar
    }
  })
})
socket.on('user-left', (username: string, avatar: string) => {
  state.Messages.push({
    id: state.id++,
    data: {
      content: username + ' has left the channel ' + state.channelName,
      avatar: avatar
    }
  })
})

socket.on('success', (msg: string) => {
  notify({
    type: 'success',
    text: msg
  })
})

socket.on('error', (msg: string) => {
  notify({
    type: 'error',
    text: msg
  })
})

export const socketConnect = () => {
  const token = getCookie('token')
  if (!token) {
    throw new Error('No token found')
  }

  socket.auth = { token: token }
  socket.connect()
}

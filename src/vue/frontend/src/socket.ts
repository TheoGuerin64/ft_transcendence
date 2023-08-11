import { io } from 'socket.io-client'
import { reactive } from 'vue'
import { getCookie } from './utils'

export const state = reactive({
  connected: false
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

export const socketConnect = () => {
  const token = getCookie('token')
  if (!token) {
    throw new Error('No token found')
  }

  socket.auth = { token: token }
  socket.connect()
}

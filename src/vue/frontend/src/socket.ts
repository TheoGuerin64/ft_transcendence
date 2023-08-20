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
  idMessage: 0,
  joined: false
})

export const socket = io('http://localhost:3000', {
  autoConnect: false
})

let routerInstance = null

export function setRouterInstance(router: any) {
  routerInstance = router
}

socket.on('connect', () => {
  state.connected = true
})

socket.on('disconnect', () => {
  state.connected = false
})

socket.on('message', (msg: string, username: string, avatar: string, login: string) => {
  state.Messages.push({
    id: state.idMessage++,
    data: {
      content: msg,
      user: {
        username: username,
        avatar: avatar,
        login: login
      }
    }
  })
})

socket.on('user-joined', (username: string, avatar: string, login: string, channelName: string) => {
  state.Messages.push({
    id: state.idMessage++,
    data: {
      content: username + ' has joined the channel ' + state.channelName,
      user: {
        username: username,
        avatar: avatar,
        login: login
      }
    }
  })
  routerInstance.push('/chat/' + channelName)
})

socket.on('user-left', (username: string, avatar: string, login: string) => {
  state.Messages.push({
    id: state.idMessage++,
    data: {
      content: username + ' has left the channel ' + state.channelName,
      user: {
        username: username,
        avatar: avatar,
        login: login
      }
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
  routerInstance.push('/chat')
})

export const socketConnect = () => {
  const token = getCookie('token')
  if (!token) {
    throw new Error('No token found')
  }

  socket.auth = { token: token }
  socket.connect()
}

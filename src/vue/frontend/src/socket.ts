import PongView from './views/PongViews/PongView.vue'
import { getCookie } from './utils'
import { io } from 'socket.io-client'
import { notify } from '@kyvg/vue3-notification'
import { playerStatus } from './store'

import { reactive, type ComponentOptions } from 'vue'

export const state = reactive({
  connected: false,
  Messages: [] as Array<{
    id: number
    data: any
  }>,
  channelName: '' as string,
  idMessage: 0,
  joined: false,
  gameParam: {
    scorePlayerOne: 0,
    scorePlayerTwo: 0,
    status: playerStatus.LOBBY,
    winner: ''
  },
  gameFunctions: {
    ballMovement: (posX: number, posY: number) => {},
    someoneMoved: (login: string, posY: number) => {},
    killCanvas: () => {}
  }
})

const PongViewMethods = (PongView as ComponentOptions).methods

export const socket = io('http://localhost:3000', {
  autoConnect: false
}) as any

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
        name: username,
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
      content: username + ' has joined the channel ' + channelName,
      user: {
        name: username,
        avatar: avatar,
        login: login
      }
    }
  })
})

socket.on('user-left', (username: string, avatar: string, login: string, channelName: string) => {
  state.Messages.push({
    id: state.idMessage++,
    data: {
      content: username + ' has left the channel ' + channelName,
      user: {
        name: username,
        avatar: avatar,
        login: login
      }
    }
  })
})

socket.on('reload', () => {
  location.reload()
})

socket.on('reset', () => {
  routerInstance.push('/chat')
})

socket.on('channel-created', async (channelName: string) => {
  location.reload()
  routerInstance.push('/chat')
  notify({
    type: 'success',
    text: 'Channel ' + channelName + ' created'
  })
})

socket.on('channel-removed', (channelName: string) => {
  location.reload()
  routerInstance.push('/chat')
  notify({
    type: 'success',
    text: 'Channel ' + channelName + ' removed'
  })
})

socket.on('dm-created', (channelName: string) => {
  routerInstance.push('/chat/' + channelName)
  notify({
    type: 'success',
    text: 'DM created'
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

socket.on('redirect', (channelName: string) => {
  routerInstance.push('/chat/' + channelName)
})

socket.on('error-banned', () => {
  notify({
    type: 'error',
    text: 'You are banned from this channel'
  })
  routerInstance.push('/chat')
})

socket.on('findGame', (playerOneLogin: string, playerTwoLogin: string, gameType: string) => {
  socket.emit('joinGameRoom')
  PongViewMethods.init(playerOneLogin, playerTwoLogin, gameType)
})
socket.on('ballMovement', (posX: number, posY: number) => {
  state.gameFunctions.ballMovement(posX, posY)
})
socket.on('someoneMoved', (login: string, posY: number) => {
  state.gameFunctions.someoneMoved(login, posY)
})
socket.on('PlayerOneWinPoint', () => {
  PongViewMethods.incrementPlayerOneScore()
})
socket.on('PlayerTwoWinPoint', () => {
  PongViewMethods.incrementPlayerTwoScore()
})
socket.on('PlayerOneWinGame', (login: string) => {
  PongViewMethods.PlayerOneWinGame(login)
})
socket.on('PlayerTwoWinGame', (login: string) => {
  PongViewMethods.PlayerTwoWinGame(login)
})

export const socketConnect = () => {
  const token = getCookie('token')
  if (!token) {
    throw new Error('No token found')
  }

  socket.auth = { token: token }
  socket.connect()
}

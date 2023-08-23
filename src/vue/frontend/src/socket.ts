import * as THREE from 'three'
import PongView from './views/PongViews/PongView.vue'
import { getCookie } from './utils'
import { io } from 'socket.io-client'
import { playerStatus } from './store'
import { reactive, type ComponentOptions } from 'vue'

export const state = reactive({
  connected: false,
  gameElements: {
    init: false,
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000),
    renderer: new THREE.WebGLRenderer({
      antialias: true
    })
  },
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
})

socket.on('connect', () => {
  state.connected = true
})

socket.on('disconnect', () => {
  state.connected = false
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

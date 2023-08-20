import GameView from './views/GameView.vue'
import { getCookie } from './utils'
import { io } from 'socket.io-client'
import { reactive, type ComponentOptions } from 'vue'
export const state = reactive({
  connected: false,
  gameParam: {
    scorePlayerOne: 0,
    scorePlayerTwo: 0,
    inGame: false,
    inQueue: false,
    gameEnded: false,
    winner: ''
  }
})

const GameViewMethods = (GameView as ComponentOptions).methods

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
  GameViewMethods.init(playerOneLogin, playerTwoLogin, gameType)
})
socket.on('ballMovement', (posX: number, posY: number) => {
  GameViewMethods.ballMovement(posX, posY)
})
socket.on('someoneMoved', (login: string, posY: number) => {
  GameViewMethods.someoneMoved(login, posY)
})
socket.on('PlayerOneWinPoint', () => {
  GameViewMethods.incrementPlayerOneScore()
})
socket.on('PlayerTwoWinPoint', () => {
  GameViewMethods.incrementPlayerTwoScore()
})
socket.on('PlayerOneWinGame', (login: string) => {
  GameViewMethods.PlayerOneWinGame(login)
})
socket.on('PlayerTwoWinGame', (login: string) => {
  GameViewMethods.PlayerTwoWinGame(login)
})

export const socketConnect = () => {
  const token = getCookie('token')
  if (!token) {
    throw new Error('No token found')
  }

  socket.auth = { token: token }
  socket.connect()
}

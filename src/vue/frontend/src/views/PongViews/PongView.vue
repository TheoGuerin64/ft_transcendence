<script setup lang="ts">
import { playerStatus } from '../../store'
import * as THREE from 'three'
import { socket, state } from '../../socket'
import gameView from './GameView.vue'
import lobbyView from './LobbyView.vue'
import postGameView from './PostGameView.vue'
import queueView from './QueueView.vue'
</script>

<script lang="ts">
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({
  antialias: true
})
scene.add(camera)
camera.position.z = 5
document.body.appendChild(renderer.domElement)

export default {
  mounted() {
    this.joinLobby()
    this.connect()
  },
  beforeUnmount() {
    socket?.emit('changePage')
    state.gameFunctions.killCanvas()
    this.joinLobby()
  },
  methods: {
    /**
     * init the game and call all functions for that
     * @param playerOneLogin login of one user
     * @param playerTwoLogin login of one user
     * @param gameType normal or custom game
     */
    init(playerOneLogin: string, playerTwoLogin: string, gameType: string) {
      renderer.domElement.style.display = 'inline'
      state.gameParam.status = playerStatus.GAME

      let idCanvas: number
      let ball: THREE.Mesh

      /**
       * create the scene, the camera, the renderer,
       * add event listener for key and resize
       * and add elements to the scene
       */
      const setCanvas = () => {
        //renderer.domElement.style.display = 'inline'
        document.addEventListener('keyup', this.checkInput)
        document.addEventListener('keydown', this.checkInput)
        window.addEventListener('resize', resizeCanva)

        addElements()
        animate()
      }

      /**
       * add background, ball, players
       * and cube if it's a custom game
       */
      const addElements = () => {
        const backgroundGeometry = new THREE.BoxGeometry(4, 4, 0)
        const backgroundMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
        const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial)
        background.position.set(0, 0, 0)
        scene.add(background)

        const geometry = new THREE.BoxGeometry(0.15, 0.15, 0)
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
        ball = new THREE.Mesh(geometry, material)
        ball.position.set(0, 0, 0)

        if (gameType === 'custom') {
          const centralCubeGeometry = new THREE.BoxGeometry(1, 1, 0)
          const centralCubeMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff })
          const centralCube = new THREE.Mesh(centralCubeGeometry, centralCubeMaterial)
          centralCube.position.set(0, 0, 0)
          ball.position.y = 1.5
          scene.add(centralCube)
        }
        scene.add(ball)

        addNewPlayer(playerOneLogin, -2 - 0.1 / 2)
        addNewPlayer(playerTwoLogin, 2 + 0.1 / 2)
      }

      /**
       * create a new user on the scene
       * and change the uuid to his login to recognize him
       * @param login login of the user
       * @param posX position on the X axe
       */
      const addNewPlayer = (login: string, posX: number) => {
        const geometry = new THREE.BoxGeometry(0.1, 0.5, 0)
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
        const newPlayer = new THREE.Mesh(geometry, material)
        scene.add(newPlayer)
        newPlayer.uuid = login
        newPlayer.position.set(posX, 0, 0)
      }

      /**
       * start the animation loop
       */
      const animate = () => {
        idCanvas = requestAnimationFrame(animate)
        renderer.render(scene, camera)
      }

      /**
       * update ball position
       */
      state.gameFunctions.ballMovement = (posX, posY) => {
        ball.position.set(posX, posY, 0)
      }

      /**
       * update player position
       */
      state.gameFunctions.someoneMoved = (login: string, posY: number) => {
        const arrayElements: THREE.Mesh[] = scene.children
        const elementToMove = arrayElements.find((element) => element.uuid === login)
        if (elementToMove === undefined) {
          return
        }
        elementToMove.position.y = posY
      }

      /**
       * kill the canvas and stop everything
       */
      state.gameFunctions.killCanvas = () => {
        cancelAnimationFrame(idCanvas)
        renderer.domElement.style.display = 'none'
      }

      /**
       * resize the canvas so it's responsive
       */
      const resizeCanva = () => {
        const canvas = renderer.domElement
        const pixelRatio = window.devicePixelRatio
        renderer.setPixelRatio(pixelRatio)

        if (window.innerWidth > window.innerHeight) {
          canvas.style.width = 'auto'
          canvas.style.height = '100vh'
          canvas.style.aspectRatio = '1/1'
        } else {
          canvas.style.width = '100vw'
          canvas.style.height = 'auto'
          canvas.style.aspectRatio = '1/1'
        }
        let width = canvas.clientWidth * pixelRatio
        let height = canvas.clientHeight * pixelRatio
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height, false)
      }
      setCanvas()
      resizeCanva()
    },

    /**
     * connect to the lobby
     */
    connect() {
      socket.emit('connectGame')
    },

    /**
     * join a queue to play
     * @param queueType normal or custom queue
     */
    joinQueue(queueType: string) {
      if (queueType === 'normal') {
        socket.emit('joinNormalQueue')
      } else if (queueType === 'custom') {
        socket.emit('joinCustomQueue')
      }
      state.gameParam.status = playerStatus.QUEUE
    },

    /**
     * left the queue
     */
    leftQueue() {
      socket.emit('leftQueue')
      state.gameParam.status = playerStatus.LOBBY
    },

    /**
     * move the player
     * @param event keyboard event (press, release, etc ...)
     */
    checkInput(event: KeyboardEvent) {
      socket.emit('playerMovement', event.key, event.type)
    },

    /**
     * reset state
     */
    joinLobby() {
      state.gameParam.status = playerStatus.LOBBY
      state.gameParam.winner = ''
      state.gameParam.scorePlayerOne = 0
      state.gameParam.scorePlayerTwo = 0
    },

    /**
     * increment players score
     */
    incrementPlayerOneScore() {
      state.gameParam.scorePlayerOne++
    },
    incrementPlayerTwoScore() {
      state.gameParam.scorePlayerTwo++
    },

    /**
     * stop the game and change the page to post game
     * @param login login of the winner
     */
    PlayerOneWinGame(login: string) {
      state.gameFunctions.killCanvas()
      state.gameParam.status = playerStatus.POSTGAME
      state.gameParam.winner = login
    },
    PlayerTwoWinGame(login: string) {
      state.gameFunctions.killCanvas()
      state.gameParam.status = playerStatus.POSTGAME
      state.gameParam.winner = login
    }
  }
}
</script>

<template>
  <h1 class="title is-1 has-text-centered">Game</h1>
  <div class="has-text-centered">
    <lobbyView @joinQueue="(queueType) => joinQueue(queueType)" />
    <queueView @leftQueue="() => leftQueue()" />
    <gameView />
    <postGameView @joinLobby="() => joinLobby()" />
  </div>
</template>

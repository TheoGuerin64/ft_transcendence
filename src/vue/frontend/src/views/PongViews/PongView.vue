<script setup lang="ts">
import { playerStatus, gameElements } from '../../store'
import * as THREE from 'three'
import { socket, state } from '../../socket'
import gameView from './GameView.vue'
import lobbyView from './LobbyView.vue'
import postGameView from './PostGameView.vue'
import queueView from './QueueView.vue'
</script>

<script lang="ts">
export default {
  data() {
    return {
      count: 0
    }
  },
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
      if (gameElements.isInit === false) {
        gameElements.init()
        if (gameElements.renderer !== null) {
          document.body.appendChild(gameElements.renderer.domElement)
          gameElements.renderer.domElement.id = 'canva'
        }
      }
      if (gameElements.renderer === null) {
        return
      }
      gameElements.renderer.domElement.style.display = 'block'
      state.gameParam.status = playerStatus.GAME
      this.count++

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
        addLine(2)
        addLine(-2)
        addBall()
        if (gameType === 'custom') {
          addCube()
          ball.position.y = 1.5
        }
        addNewPlayer(playerOneLogin, -2 - 0.1 / 2)
        addNewPlayer(playerTwoLogin, 2 + 0.1 / 2)
      }

      /** add a ball to the canva
       */
      const addBall = () => {
        if (gameElements.scene === null) {
          return
        }
        const geometry = new THREE.BoxGeometry(0.15, 0.15, 0)
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff })
        ball = new THREE.Mesh(geometry, material)
        ball.position.set(0, 0, 0)
        gameElements.scene.add(ball)
      }

      /** add a cube to the canva
       */
      const addCube = () => {
        if (gameElements.scene === null) {
          return
        }
        const centralCubeGeometry = new THREE.BoxGeometry(1, 1, 0)
        const centralCubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
        const centralCube = new THREE.Mesh(centralCubeGeometry, centralCubeMaterial)
        centralCube.position.set(0, 0, 0)
        ball.position.y = 1.5
        gameElements.scene.add(centralCube)
      }

      /** add lines to the canva to delimit the field
       */
      const addLine = (posY: number) => {
        if (gameElements.scene === null) {
          return
        }
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3 })
        const points = []
        points.push(new THREE.Vector3(-2 - 0.1, posY, 0))
        points.push(new THREE.Vector3(2 + 0.1, posY, 0))
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
        const line = new THREE.Line(lineGeometry, lineMaterial)
        gameElements.scene.add(line)
      }

      /**
       * create a new user on the scene
       * and change the uuid to his login to recognize him
       * @param login login of the user
       * @param posX position on the X axe
       */
      const addNewPlayer = (login: string, posX: number) => {
        if (gameElements.scene === null) {
          return
        }
        const geometry = new THREE.BoxGeometry(0.1, 0.5, 0)
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff })
        const newPlayer = new THREE.Mesh(geometry, material)
        gameElements.scene.add(newPlayer)
        newPlayer.uuid = login
        newPlayer.position.set(posX, 0, 0)
      }

      /**
       * start the animation loop
       */
      const animate = () => {
        if (
          gameElements.renderer === null ||
          gameElements.scene === null ||
          gameElements.camera === null
        ) {
          return
        }
        idCanvas = requestAnimationFrame(animate)
        gameElements.renderer.render(gameElements.scene, gameElements.camera)
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
        if (gameElements.scene === null) {
          return
        }
        const arrayElements: THREE.Mesh[] = gameElements.scene.children as THREE.Mesh[]
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
        if (gameElements.renderer === null || gameElements.scene === null) {
          return
        }
        cancelAnimationFrame(idCanvas)
        gameElements.scene.clear()
        gameElements.renderer.domElement.style.display = 'none'
      }

      /**
       * resize the canvas so it's responsive
       */
      const resizeCanva = () => {
        if (gameElements.renderer === null || gameElements.camera === null) {
          return
        }
        const canvas = gameElements.renderer.domElement
        const pixelRatio = window.devicePixelRatio
        gameElements.renderer.setPixelRatio(pixelRatio)

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
        gameElements.camera.aspect = width / height
        gameElements.camera.updateProjectionMatrix()
        gameElements.renderer.setSize(width, height, false)
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
  <h1 class="title is-1 has-text-centered mt-4">Game</h1>
  <div class="has-text-centered">
    <lobbyView @joinQueue="(queueType) => joinQueue(queueType)" />
    <queueView @leftQueue="() => leftQueue()" />
    <gameView />
    <postGameView @joinLobby="() => joinLobby()" />
  </div>
</template>

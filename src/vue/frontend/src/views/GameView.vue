<script setup lang="ts">
import { useStore } from '../store'
import { io } from 'socket.io-client'
import * as THREE from 'three'
import { socket, state } from '@/socket'
</script>

<script lang="ts">
export default {
  data() {
    return {
      useStore,

      ballMovement: (posX: number, posY: number) => {},
      someoneMoved: (login: string, posY: number) => {},
      killCanvas: () => {}
    }
  },

  mounted() {
    this.connect()
  },
  beforeUnmount() {
    socket?.emit('changePage')
    this.killCanvas()
  },
  methods: {
    init(playerOneLogin: string, playerTwoLogin: string, gameType: string) {
      state.gameParam.inGame = true
      state.gameParam.inQueue = false
      let scene: THREE.Scene
      let camera: THREE.PerspectiveCamera
      let renderer: THREE.WebGLRenderer
      let idCanvas: number
      let ball: THREE.Mesh
      const setCanvas = () => {
        scene = new THREE.Scene()
        camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000)
        scene.add(camera)
        const container = document.getElementById('canva')
        if (container !== null) {
          renderer = new THREE.WebGLRenderer({
            antialias: true,
            canvas: container
          })
        }
        document.addEventListener('keydown', this.checkInput, false)
        window.addEventListener('resize', resizeCanva)
        camera.position.z = 5

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

        animate()
      }
      const addNewPlayer = (login: string, posX: number) => {
        const geometry = new THREE.BoxGeometry(0.1, 0.5, 0)
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
        const newPlayer = new THREE.Mesh(geometry, material)
        scene.add(newPlayer)
        newPlayer.uuid = login
        newPlayer.position.set(posX, 0, 0)
      }
      const animate = () => {
        idCanvas = requestAnimationFrame(animate)
        renderer.render(scene, camera)
      }

      this.ballMovement = (posX, posY) => {
        ball.position.set(posX, posY, 0)
      }

      this.someoneMoved = (login: string, posY: number) => {
        const arrayElements: THREE.Mesh[] = scene.children
        const elementToMove = arrayElements.find((element) => element.uuid === login)
        if (elementToMove === undefined) {
          return
        }
        elementToMove.position.y = posY
      }

      this.killCanvas = () => {
        cancelAnimationFrame(idCanvas)
        renderer.dispose()
        renderer.forceContextLoss()
        document.getElementById('canva')?.remove()
        const newCanvas = document.createElement('canvas')
        newCanvas.id = 'canva'
        document.body.appendChild(newCanvas)
        state.gameParam.gameEnded = false
        state.gameParam.inGame = false
        state.gameParam.inQueue = false
      }

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
    connect() {
      socket.emit('connectGame')
    },
    joinQueue(queueType: string) {
      if (queueType === 'normal') {
        socket.emit('joinNormalQueue')
      } else if (queueType === 'custom') {
        socket.emit('joinCustomQueue')
      }
      state.gameParam.inQueue = true
    },

    checkInput(event: KeyboardEvent) {
      socket.emit('playerMovement', event.key)
    },
    returnLobby() {
      state.gameParam.gameEnded = false
      state.gameParam.winner = ''
      state.gameParam.scorePlayerOne = 0
      state.gameParam.scorePlayerTwo = 0
    },
    incrementPlayerOneScore() {
      state.gameParam.scorePlayerOne++
    },
    incrementPlayerTwoScore() {
      state.gameParam.scorePlayerTwo++
    },
    PlayerOneWinGame(login: string) {
      this.killCanvas()
      state.gameParam.gameEnded = true
      state.gameParam.winner = login
    },
    PlayerTwoWinGame(login: string) {
      this.killCanvas()
      state.gameParam.gameEnded = true
      state.gameParam.winner = login
    }
  }
}
</script>

<template>
  <h1 class="title is-1 has-text-centered">Game</h1>
  <div class="has-text-centered">
    <div v-if="state.gameParam.inQueue">
      <p>currently in queue, please wait</p>
      <div class="lds-dual-ring"></div>
    </div>
    <div
      v-else-if="state.gameParam.inGame"
      class="column is-flex is-half is-offset-one-quarter is-justify-content-space-between"
    >
      <p>Player One: {{ state.gameParam.scorePlayerOne }}</p>
      <p>Player Two: {{ state.gameParam.scorePlayerTwo }}</p>
    </div>
    <div v-else-if="state.gameParam.gameEnded" class="box">
      <p v-if="state.gameParam.winner === 'surrender'">
        the other player left the game, you won by forfeit
      </p>
      <p v-else>
        the winner is {{ state.gameParam.winner }} ! The score is
        {{ state.gameParam.scorePlayerOne }} - {{ state.gameParam.scorePlayerTwo }}
      </p>
      <button @click="returnLobby" class="button mx-3 is-light">return to lobby</button>
    </div>
    <div v-else>
      <button @click="joinQueue('normal')" class="button mx-3 is-light">Join Normal Queue</button>
      <button @click="joinQueue('custom')" class="button mx-3 is-light">Join Custom Queue</button>
    </div>
    <canvas id="canva"> </canvas>
  </div>
</template>

<style>
#canva {
  margin: auto;
  display: block;
}

.lds-dual-ring {
  display: inline-block;
  width: 80px;
  height: 80px;
}
.lds-dual-ring:after {
  content: ' ';
  display: block;
  width: 64px;
  height: 64px;
  margin: 8px;
  border-radius: 50%;
  border: 6px solid #000;
  border-color: #000 transparent #000 transparent;
  animation: lds-dual-ring 1.2s linear infinite;
}
@keyframes lds-dual-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>

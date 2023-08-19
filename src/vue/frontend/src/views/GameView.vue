<script setup lang="ts">
import { store } from '../store'
import * as THREE from 'three'
import { io } from 'socket.io-client'
</script>

<script lang="ts">
export default {
  data() {
    return {
      store,
      login: store.user?.name,
      socket: null as any,
      scorePlayerOne: 0,
      scorePlayerTwo: 0,
      inGame: false,
      inQueue: false,
      gameEnded: false,
      winner: '',

      ballMovement: (posX: number, posY: number) => {},
      someoneMoved: (login: string, posY: number) => {},
      killCanvas: () => {}
    }
  },
  created() {
    if (this.store.user === undefined) {
      this.$router.push('/')
      return
    }
    this.socket = io('http://localhost:3000')
  },
  mounted() {
    if (this.store.user === undefined) {
      this.$router.push('/')
      return
    }

    this.connect()
    this.listenMessages()
  },
  beforeUnmount() {
    this.socket?.emit('changePage')
    this.killCanvas()
  },
  methods: {
    init(playerOneLogin: string, playerTwoLogin: string) {
      this.inGame = true
      this.inQueue = false
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

        const geometry2 = new THREE.BoxGeometry(4, 4, 0)
        const material2 = new THREE.MeshBasicMaterial({ color: 0xffffff })
        const plane = new THREE.Mesh(geometry2, material2)
        plane.position.set(0, 0, 0)
        scene.add(plane)

        const geometry = new THREE.BoxGeometry(0.15, 0.15, 0)
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
        ball = new THREE.Mesh(geometry, material)
        ball.position.set(0, 0, 0)
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
        newPlayer.position.x = posX
        newPlayer.position.y = 0
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
        this.gameEnded = false
        this.inGame = false
        this.inQueue = false
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
      this.socket.emit('connectGame', this.login)
    },
    listenMessages() {
      this.socket.on('findGame', (playerOneLogin: string, playerTwoLogin: string) => {
        this.socket.emit('joinGameRoom')
        this.init(playerOneLogin, playerTwoLogin)
      })
      this.socket.on('ballMovement', (posX: number, posY: number) => {
        this.ballMovement(posX, posY)
      })
      this.socket.on('someoneMoved', (login: string, posY: number) => {
        this.someoneMoved(login, posY)
      })
      this.socket.on('PlayerOneWinPoint', () => {
        this.scorePlayerOne++
      })
      this.socket.on('PlayerTwoWinPoint', () => {
        this.scorePlayerTwo++
      })
      this.socket.on('PlayerOneWinGame', (login: string) => {
        this.killCanvas()
        this.gameEnded = true
        this.winner = login
      })
      this.socket.on('PlayerTwoWinGame', (login: string) => {
        this.killCanvas()
        this.gameEnded = true
        this.winner = login
      })
    },
    joinQueue() {
      this.socket.emit('joinQueue', this.login)
      this.inQueue = true
    },
    checkInput(event: KeyboardEvent) {
      this.socket.emit('playerMovement', event.key)
    },
    returnLobby() {
      this.gameEnded = false
      this.winner = ''
      this.scorePlayerOne = 0
      this.scorePlayerTwo = 0
    }
  }
}
</script>

<template>
  <routerLink to="/">Home</routerLink> |
  <routerLink to="/MatchHistory">Match History</routerLink>
  <h1 class="title is-1 has-text-centered">Game</h1>
  <div class="has-text-centered">
    <div v-if="inQueue">
      <p>currently in queue, please wait</p>
      <div class="lds-dual-ring"></div>
    </div>
    <div
      v-else-if="inGame"
      class="column is-flex is-half is-offset-one-quarter is-justify-content-space-between"
    >
      <p>Player One: {{ scorePlayerOne }}</p>
      <p>Player Two: {{ scorePlayerTwo }}</p>
    </div>
    <div v-else-if="gameEnded" class="box">
      <p>the winner is {{ winner }} ! The score is {{ scorePlayerOne }} - {{ scorePlayerTwo }}</p>
      <button @click="returnLobby" class="button mx-3 is-light">return to lobby</button>
    </div>
    <div v-else>
      <button @click="joinQueue" class="button mx-3 is-light">Join Normal Queue</button>
      <button @click="joinQueue" class="button mx-3 is-light">Join Custom Queue</button>
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

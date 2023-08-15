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
        this.$router.push('/')
        this.socket?.disconnect()
        this.scorePlayerOne = 0
        this.scorePlayerTwo = 0
        this.inGame = false
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
      this.socket.on('PlayerOneWinGame', () => {
        this.scorePlayerOne++
        this.killCanvas()
      })
      this.socket.on('PlayerTwoWinGame', () => {
        this.scorePlayerTwo++
        this.killCanvas()
      })
    },
    joinQueue() {
      this.socket.emit('joinQueue', this.login)
    },
    checkInput(event: KeyboardEvent) {
      this.socket.emit('playerMovement', event.key)
    }
  }
}
</script>

<template>
  <routerLink to="/">Home</routerLink> |
  <routerLink to="/MatchHistory">Match History</routerLink>
  <h1>Game</h1>
  <div v-if="!inGame">
    <button @click="joinQueue">Join Normal Queue</button>
  </div>
  <div v-else>
    <p ref="scorePlayerOne">Player One: {{ scorePlayerOne }}</p>
    <p ref="scorePlayerTwo">Player Two: {{ scorePlayerTwo }}</p>
  </div>
  <canvas id="canva"> </canvas>
</template>

<style>
#canva {
  margin: auto;
  display: block;
}
</style>

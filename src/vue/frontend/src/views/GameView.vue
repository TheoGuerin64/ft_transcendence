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

      ballMovement: (posX: number, posY: number) => {},
      someoneMoved: (login: string, posY: number) => {}
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
      console.log('player one win !')
    })
    this.socket.on('PlayerTwoWinGame', () => {
      console.log('player two win !')
    })
  },
  beforeUnmount() {},
  methods: {
    init(playerOneLogin: string, playerTwoLogin: string) {
      let scene: THREE.Scene
      let camera: THREE.PerspectiveCamera
      let renderer: THREE.WebGLRenderer
      let idCanvas: number
      let ball: THREE.Mesh
      const setCanvas = () => {
        scene = new THREE.Scene()
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        renderer = new THREE.WebGLRenderer()
        renderer.domElement.id = 'CanvasGame'
        renderer.setSize(window.innerWidth, window.innerHeight)
        document.body.appendChild(renderer.domElement)
        document.addEventListener('keydown', this.checkInput, false)
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

      setCanvas()
    },
    connect() {
      this.socket.emit('connectGame', this.login)
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
  <html>
    <body>
      <routerLink to="/">Home</routerLink>
      <h1>Game</h1>
      <button @click="joinQueue">Join Normal Queue</button>
      <p ref="scorePlayerOne">Player One: {{ scorePlayerOne }}</p>
      <p ref="scorePlayerTwo">Player Two: {{ scorePlayerTwo }}</p>
    </body>
  </html>
</template>

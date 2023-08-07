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
      socket: null as any,
      loginPlayer: store.user?.name as string,
      killCanvas: function () {},
      loadPlayers: function (Players: { login: string; posX: number; posY: number }[]) {},
      addNewPlayer: function (Player: { login: string; posX: number; posY: number }) {},
      someoneMoved: function (
        keyCode: string,
        Player: { login: string; posX: number; posY: number }
      ) {},
      someoneDisconnected: function (login: string) {},
      someoneAlreadyConnect: function () {},
      movementBall: function (posX: number, posY: number) {}
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
    this.socket.emit('connection', this.loginPlayer)
    this.socket.on('loadPlayers', (Players: { login: string; posX: number; posY: number }[]) => {
      this.loadPlayers(Players)
    })
    this.socket.on('newPlayerJoined', (Player: { login: string; posX: number; posY: number }) => {
      this.addNewPlayer(Player)
    })
    this.socket.on(
      'someoneMoved',
      (keyCode: string, Player: { login: string; posX: number; posY: number }) => {
        this.someoneMoved(keyCode, Player)
      }
    )
    this.socket.on('playerDisconnected', (login: string) => {
      this.someoneDisconnected(login)
    })
    this.socket.on('alreadyConnect', () => {
      this.someoneAlreadyConnect()
    })

    this.socket.on('movementBall', (posX, posY) => {
      this.movementBall(posX, posY)
    })
    this.socket.on('gameStarted', (gameString: string) => {
      console.log('gameStart')
      this.init()
      const game = JSON.parse(gameString)
      this.addNewPlayer({
        login: game.playerOne.login,
        posX: game.playerOne.posX,
        posY: game.playerOne.posY
      })
      this.addNewPlayer({
        login: game.playerTwo.login,
        posX: game.playerTwo.posX,
        posY: game.playerTwo.posY
      })
    })
    this.socket.on('alreadyInQueue', () => {
      console.log('already in queue')
    })
  },
  beforeUnmount() {
    this.killCanvas()
  },
  methods: {
    init() {
      let scene: THREE.Scene
      let camera: THREE.PerspectiveCamera
      let renderer: THREE.WebGLRenderer
      let idCanvas: number
      let sphere: THREE.Mesh
      const setCanvas = () => {
        scene = new THREE.Scene()
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        renderer = new THREE.WebGLRenderer()
        renderer.domElement.id = 'CanvasGame'
        renderer.setSize(window.innerWidth, window.innerHeight)
        document.body.appendChild(renderer.domElement)
        document.addEventListener('keydown', checkInput, false)
        camera.position.z = 5
        const geometry = new THREE.SphereGeometry(0.25)
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
        sphere = new THREE.Mesh(geometry, material)
        sphere.position.set(-2, -2, 0)
        scene.add(sphere)
        animate()
      }
      const animate = () => {
        idCanvas = requestAnimationFrame(animate)
        renderer.render(scene, camera)
      }

      const checkInput = (event: KeyboardEvent) => {
        this.socket.emit('movementPlayer', this.loginPlayer, event.key)
      }

      this.killCanvas = () => {
        this.socket.emit('unconnection', this.loginPlayer)
        cancelAnimationFrame(idCanvas)
        document.getElementById('CanvasGame')?.remove()
      }

      this.someoneAlreadyConnect = () => {
        cancelAnimationFrame(idCanvas)
        document.getElementById('CanvasGame')?.remove()
        this.$router.push('/')
        this.socket.disconnect()
      }

      this.loadPlayers = (Players: { login: string; posX: number; posY: number }[]) => {
        let i: any
        for (i in Players) {
          this.addNewPlayer(Players[i])
        }
      }
      this.addNewPlayer = (Player: { login: string; posX: number; posY: number }) => {
        const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
        const newPlayer = new THREE.Mesh(geometry, material)
        scene.add(newPlayer)
        newPlayer.uuid = Player.login
        newPlayer.position.x = Player.posX
        newPlayer.position.y = Player.posY
      }

      this.someoneMoved = (
        keyCode: string,
        Player: { login: string; posX: number; posY: number }
      ) => {
        const arrayElements: THREE.Mesh[] = scene.children
        const index = arrayElements.findIndex((element) => element.uuid === Player.login)
        if (index == -1) {
          return
        }
        const elementToMove: THREE.Mesh = arrayElements[index]
        elementToMove.position.x = Player.posX
        elementToMove.position.y = Player.posY
      }

      this.someoneDisconnected = (login: string) => {
        const arrayElements: THREE.Mesh[] = scene.children
        const index = arrayElements.findIndex((element) => element.uuid === login)
        if (index == -1) return
        const elementToDelete: THREE.Mesh = arrayElements[index]
        scene.remove(elementToDelete)
      }

      this.movementBall = (posX: number, posY: number) => {
        sphere.position.set(posX, posY, 0)
        console.log('movementBall')
        this.socket.emit('movementBall')
      }

      this.socket.emit('movementBall')
      setCanvas()
    },
    joinNormalQueue(): void {
      this.socket.emit('joinNormalQueue', this.loginPlayer)
    }
  }
}
</script>

<template>
  <html>
    <body>
      <routerLink to="/">Home</routerLink>
      <h1>Game</h1>
      <button @click="joinNormalQueue">Join Normal Queue</button>
    </body>
  </html>
</template>

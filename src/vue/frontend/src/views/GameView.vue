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
      killCanvas: function () {},
      loadPlayers: function (Players: { id: number; posX: number; posY: number }[]) {},
      addNewPlayer: function (Player: { id: number; posX: number; posY: number }) {},
      someoneMoved: function (Player: { id: number; posX: number; posY: number }) {},
      someoneDisconnected: function (id: number) {}
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
    this.init()
    this.socket.on('loadPlayers', (Players: { id: number; posX: number; posY: number }[]) => {
      this.loadPlayers(Players)
    })
    this.socket.on('newPlayerJoined', (Player: { id: number; posX: number; posY: number }) => {
      this.addNewPlayer(Player)
    })
    this.socket.on('someoneMoved', (Player: { id: number; posX: number; posY: number }) => {
      this.someoneMoved(Player)
    })
    this.socket.on('playerDisconnected', (id: number) => {
      this.someoneDisconnected(id)
    })
  },
  unmounted() {
    this.killCanvas()
  },
  methods: {
    init() {
      let scene: THREE.Scene
      let camera: THREE.PerspectiveCamera
      let renderer: THREE.WebGLRenderer
      let idCanvas: number
      const idPlayer: number = Math.round(Math.random() * 100000)
      const setCanvas = () => {
        scene = new THREE.Scene()
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        renderer = new THREE.WebGLRenderer()
        renderer.domElement.id = 'CanvasGame'
        renderer.setSize(window.innerWidth, window.innerHeight)
        document.body.appendChild(renderer.domElement)
        document.addEventListener('keydown', checkInput, false)
        camera.position.z = 5
        this.socket.emit('connection', idPlayer)
        animate()
      }
      const animate = () => {
        idCanvas = requestAnimationFrame(animate)
        renderer.render(scene, camera)
      }

      const checkInput = (event: KeyboardEvent) => {
        const keyCode = event.key
        let updatedX = 0
        let updatedY = 0
        if (keyCode == 'w') updatedY = 0.1
        if (keyCode == 's') updatedY = -0.1
        if (keyCode == 'd') updatedX = 0.1
        if (keyCode == 'a') updatedX = -0.1
        this.socket.emit('movement', idPlayer, updatedX, updatedY)
      }

      this.killCanvas = () => {
        this.socket.emit('unconnection', idPlayer)
        cancelAnimationFrame(idCanvas)
        document.getElementById('CanvasGame')?.remove()
      }

      this.loadPlayers = (Players: { id: number; posX: number; posY: number }[]) => {
        let i: any
        for (i in Players) {
          this.addNewPlayer(Players[i])
        }
      }
      this.addNewPlayer = (Player: { id: number; posX: number; posY: number }) => {
        const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
        const newPlayer = new THREE.Mesh(geometry, material)
        scene.add(newPlayer)
        newPlayer.uuid = Player.id.toString()
        newPlayer.position.x = Player.posX
        newPlayer.position.y = Player.posY
      }

      this.someoneMoved = (Player: { id: number; posX: number; posY: number }) => {
        const arrayElements: THREE.Mesh[] = scene.children
        const index = arrayElements.findIndex((element) => Number(element.uuid) === Player.id)
        if (index == -1) return
        const elementToMove: THREE.Mesh = arrayElements[index]
        elementToMove.position.x = Player.posX
        elementToMove.position.y = Player.posY
      }

      this.someoneDisconnected = (id: number) => {
        const arrayElements: THREE.Mesh[] = scene.children
        const index = arrayElements.findIndex((element) => Number(element.uuid) === id)
        if (index == -1) return
        const elementToDelete: THREE.Mesh = arrayElements[index]
        scene.remove(elementToDelete)
      }

      setCanvas()
    }
  }
}
</script>

<template>
  <html>
    <body>
      <routerLink to="/">Home</routerLink>
      <h1>Game</h1>
    </body>
  </html>
</template>

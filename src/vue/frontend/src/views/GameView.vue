<script setup lang="ts">
import { store } from '../store'
import * as THREE from 'three'
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
const setCanvas = () => {
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  renderer = new THREE.WebGLRenderer()
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  const cube = new THREE.Mesh(geometry, material)
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)
  scene.add(cube)
  camera.position.z = 5
  animate()
}

const animate = () => {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}

setCanvas()
</script>

<script lang="ts">
export default {
  data() {
    return {
      store
    }
  },
  mounted() {
    if (this.store.user === undefined) {
      this.$router.push('/')
      return
    }
    setCanvas
  },
  methods: {}
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

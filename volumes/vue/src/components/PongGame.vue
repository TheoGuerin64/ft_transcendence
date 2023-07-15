<script lang="ts">
import pong_hit_sound from '../assets/pong_hit_sound.wav'

type Side = 'left' | 'right'

type HexColor = `#${string}`

type Font = {
  family: string
  size: number
  weight: string
}

type Size = {
  width: number
  height: number
}

type Keys = {
  up: boolean
  down: boolean
}

type CanvasConfig = {
  context: CanvasRenderingContext2D
  scale: number
  offset: Vector2
  size: Size
}

type TwoSides<T> = {
  left: T
  right: T
}

interface Drawable {
  draw(config: CanvasConfig): void
}

class Vector2 {
  public x: number
  public y: number

  constructor(x: number = 0, y: number = 0) {
    this.x = x
    this.y = y
  }

  public rotateRad(angle: number): void {
    let x = this.x
    let y = this.y
    this.x = x * Math.cos(angle) - y * Math.sin(angle)
    this.y = x * Math.sin(angle) + y * Math.cos(angle)
  }

  public rotateDeg(angle: number): void {
    this.rotateRad((angle * Math.PI) / 180)
  }
}

class Ball extends Vector2 {
  public color: HexColor
  public forward: Vector2
  public radius: number
  public speed: number

  constructor(position: Vector2 = new Vector2(10, 10), forward: Vector2 = new Vector2(1, 1)) {
    super(position.x, position.y)
    this.forward = forward

    this.color = '#fff'
    this.radius = 10
    this.speed = 5
  }

  public draw(config: CanvasConfig): void {
    config.context.fillStyle = this.color
    config.context.beginPath()
    config.context.arc(
      config.offset.x + this.x * config.scale,
      config.offset.y + this.y * config.scale,
      this.radius * config.scale,
      0,
      2 * Math.PI
    )
    config.context.fill()
    config.context.closePath()
  }
}

class Paddle extends Vector2 {
  public color: HexColor
  public speed: number
  public size: Size

  constructor(side: Side, config: CanvasConfig) {
    if (side == 'left') {
      super(20, config.size.height / 2)
    } else {
      super(config.size.width - 20, config.size.height / 2)
    }

    this.color = '#fff'
    this.size = {
      width: 12,
      height: 100
    }
    this.speed = 10
  }

  public draw(config: CanvasConfig): void {
    config.context.fillStyle = this.color
    config.context.fillRect(
      config.offset.x + this.x * config.scale - (this.size.width / 2) * config.scale,
      config.offset.y + this.y * config.scale - (this.size.height / 2) * config.scale,
      this.size.width * config.scale,
      this.size.height * config.scale
    )
  }
}

class Background {
  public color: HexColor
  public lineColor: HexColor
  public lineWidth: number

  constructor() {
    this.color = '#111'
    this.lineColor = '#fff'
    this.lineWidth = 2
  }

  public draw(config: CanvasConfig): void {
    config.context.fillStyle = this.color
    config.context.fillRect(
      config.offset.x,
      config.offset.y,
      config.size.width * config.scale,
      config.size.height * config.scale
    )

    config.context.strokeStyle = this.lineColor
    config.context.lineWidth = this.lineWidth * config.scale
    config.context.beginPath()
    config.context.setLineDash([Math.floor(20 * config.scale)])
    config.context.moveTo(config.offset.x + (config.size.width / 2) * config.scale, config.offset.y)
    config.context.lineTo(
      config.offset.x + (config.size.width / 2) * config.scale,
      config.offset.y + config.size.height * config.scale
    )
    config.context.stroke()
    config.context.closePath()
  }
}

class Score {
  public color: HexColor
  public font: Font
  public offset: Vector2
  public side: Side
  public value: number

  constructor(side: Side) {
    this.color = '#fff'
    this.font = {
      family: 'monospace',
      size: 48,
      weight: 'normal'
    }
    if (side == 'left') {
      this.offset = new Vector2(-100, 100)
    } else {
      this.offset = new Vector2(100, 100)
    }
    this.side = side
    this.value = 0
  }

  public draw(config: CanvasConfig): void {
    config.context.fillStyle = this.color
    config.context.font =
      this.font.weight + ' ' + Math.round(this.font.size * config.scale) + 'px ' + this.font.family
    config.context.textAlign = 'center'
    config.context.fillText(
      this.value.toString(),
      config.offset.x + (config.size.width / 2 - this.offset.x) * config.scale,
      config.offset.y + this.offset.y * config.scale
    )
  }
}

class EndScreen {
  public color: HexColor
  public font: Font
  public text: string
  public winner: Side

  constructor(winner: Side, playerSide: Side) {
    this.winner = winner
    this.font = {
      family: 'monospace',
      size: 150,
      weight: 'normal'
    }
    if (winner == playerSide) {
      this.color = '#0f0'
      this.text = 'You won!'
    } else {
      this.color = '#f00'
      this.text = 'You lost!'
    }
  }

  public draw(config: CanvasConfig): void {
    config.context.fillStyle = this.color
    config.context.font =
      this.font.weight + ' ' + Math.round(this.font.size * config.scale) + 'px ' + this.font.family
    config.context.textAlign = 'center'
    config.context.fillText(
      this.text,
      config.offset.x + (config.size.width / 2) * config.scale,
      config.offset.y + (config.size.height / 2) * config.scale
    )
  }
}

class Pong {
  private background: Background
  private balls: Ball[]
  private canvas: HTMLCanvasElement
  private clock: number | null
  private endScreen: EndScreen | null
  private hitSound: HTMLAudioElement
  private paddles: TwoSides<Paddle>
  private scores: TwoSides<Score>
  private side: Side
  public config: CanvasConfig
  public keys: Keys

  constructor(canvas: HTMLCanvasElement, side: Side) {
    this.canvas = canvas
    this.side = side

    this.background = new Background()
    this.balls = []
    this.config = {
      context: this.canvas.getContext('2d')!,
      scale: 1,
      offset: new Vector2(0, 0),
      size: {
        width: 1200,
        height: 800
      }
    }
    this.clock = null
    this.endScreen = null
    this.hitSound = new Audio(pong_hit_sound)
    this.paddles = {
      left: new Paddle('left', this.config),
      right: new Paddle('right', this.config)
    }
    this.scores = {
      left: new Score('left'),
      right: new Score('right')
    }
    this.keys = {
      up: false,
      down: false
    }

    this.keyHandler = this.keyHandler.bind(this)
  }

  public loop = (): void => {
    if (!this.endScreen) {
      this.input()
      this.physic()
      this.events()
    }
    this.draw()
  }

  private *toDraw(): Iterable<Drawable> {
    yield this.background
    for (const ball of this.balls) {
      yield ball
    }
    yield this.paddles.left
    yield this.paddles.right
    yield this.scores.left
    yield this.scores.right
    if (this.endScreen) {
      yield this.endScreen
    }
  }

  private draw(): void {
    this.config.context.clearRect(0, 0, this.config.size.width, this.config.size.height)
    for (const drawable of this.toDraw()) {
      drawable.draw(this.config)
    }
  }

  private playSound(sound: HTMLAudioElement): void {
    sound.pause()
    sound.currentTime = 0
    sound.play().catch((e) => {
      if (e instanceof DOMException) {
        console.log('Sound could not be played')
      } else {
        throw e
      }
    })
  }

  private ballHit(ball: Ball, paddle: Paddle, direction: -1 | 1): void {
    ball.forward.x = direction * Math.abs(ball.forward.x)
    ball.forward.rotateRad(
      ((ball.y - paddle.y) / (paddle.size.height + ball.radius)) * Math.PI * 0.5 * direction
    )
    ball.speed *= 1.1
    this.playSound(this.hitSound)
  }

  private physic(): void {
    for (const ball of this.balls) {
      ball.x += ball.speed * ball.forward.x
      ball.y += ball.speed * ball.forward.y

      if (ball.y + ball.radius >= this.config.size.height || ball.y - ball.radius <= 0) {
        ball.forward.y *= -1
        this.playSound(this.hitSound)
      }

      if (
        ball.x - ball.radius <= this.paddles.left.x + this.paddles.left.size.width / 2 &&
        ball.y + ball.radius > this.paddles.left.y - this.paddles.left.size.height / 2 &&
        ball.y - ball.radius < this.paddles.left.y + this.paddles.left.size.height / 2
      ) {
        this.ballHit(ball, this.paddles.left, 1)
      }

      if (
        ball.x + ball.radius >= this.paddles.right.x - this.paddles.right.size.width / 2 &&
        ball.y + ball.radius > this.paddles.right.y - this.paddles.right.size.height / 2 &&
        ball.y - ball.radius < this.paddles.right.y + this.paddles.right.size.height / 2
      ) {
        this.ballHit(ball, this.paddles.right, -1)
      }
    }
  }

  private input(): void {
    if (this.keys.up) {
      if (this.paddles[this.side].y - this.paddles[this.side].size.height / 2 > 0) {
        this.paddles[this.side].y -= this.paddles[this.side].speed
      }
    } else if (this.keys.down) {
      if (
        this.paddles[this.side].y + this.paddles[this.side].size.height / 2 <
        this.config.size.height
      ) {
        this.paddles[this.side].y += this.paddles[this.side].speed
      }
    }
  }

  private addScore(side: Side, score: number): void {
    this.scores[side].value += score
    if (this.scores[side].value < 5) {
      this.startRound()
    } else {
      this.endScreen = new EndScreen(side, this.side)
    }
  }

  private events(): void {
    for (const ball of this.balls) {
      if (ball.x - ball.radius <= 0) {
        this.addScore('right', 1)
      } else if (ball.x + ball.radius >= this.config.size.width) {
        this.addScore('left', 1)
      }
    }
  }

  private startRound(): void {
    this.balls = []
    let ball = new Ball(
      new Vector2(this.config.size.width / 2, this.config.size.height / 2),
      new Vector2(0, 1)
    )
    ball.forward.rotateDeg((Math.random() * 100 + 40) * (Math.random() > 0.5 ? -1 : 1))
    this.balls.push(ball)
  }

  public keyHandler(event: KeyboardEvent): void {
    if (event.key == 'w' || event.key == 'ArrowUp') {
      this.keys.up = event.type == 'keydown'
    } else if (event.key == 's' || event.key == 'ArrowDown') {
      this.keys.down = event.type == 'keydown'
    }
    // DEV
    else if (event.key == ' ' && event.type == 'keydown') {
      this.side = this.side == 'left' ? 'right' : 'left'
    }
  }

  public onResize(): void {
    let scaleWidth = this.canvas.width / this.config.size.width
    let scaleHeight = this.canvas.height / this.config.size.height
    this.config.scale = scaleWidth > scaleHeight ? scaleHeight : scaleWidth
    this.config.offset.x = (this.canvas.width - this.config.size.width * this.config.scale) / 2
    this.config.offset.y = (this.canvas.height - this.config.size.height * this.config.scale) / 2
  }

  public start(): void {
    this.clock = window.setInterval(this.loop, 1000 / 60)
    this.startRound()
  }

  public stop(): void {
    if (this.clock) window.clearInterval(this.clock)
  }
}

export default {
  data() {
    return {
      canvas: null as HTMLCanvasElement | null,
      pong: null as Pong | null
    }
  },

  methods: {
    onResize(): void {
      this.canvas!.width = this.canvas!.offsetWidth
      this.canvas!.height = this.canvas!.offsetHeight
      this.pong!.onResize()
    }
  },

  mounted() {
    this.canvas = this.$el as HTMLCanvasElement
    this.pong = new Pong(this.canvas, 'right')

    window.addEventListener('resize', this.onResize)
    window.addEventListener('keydown', this.pong!.keyHandler)
    window.addEventListener('keyup', this.pong!.keyHandler)
    this.onResize()

    this.pong.start()
  },

  unmounted() {
    this.pong!.stop()
    window.removeEventListener('resize', this.onResize)
    window.removeEventListener('keydown', this.pong!.keyHandler)
    window.removeEventListener('keyup', this.pong!.keyHandler)
  }
}
</script>

<template>
  <canvas></canvas>
</template>

<style scoped>
canvas {
  width: 90%;
  height: 90%;
  border: 1px solid #000;
  background-color: #000;
}
</style>

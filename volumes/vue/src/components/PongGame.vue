<script lang="ts">
type Side = 'left' | 'right'

class Vector2 {
  constructor(public x: number, public y: number) {}

  rotate(angle: number) {
    let x = this.x
    let y = this.y
    this.x = x * Math.cos(angle) - y * Math.sin(angle)
    this.y = x * Math.sin(angle) + y * Math.cos(angle)
  }
}

class Ball extends Vector2 {
  public speed: number
  public forward: Vector2
  public radius: number
  public color: string

  constructor(
    position: Vector2 = new Vector2(10, 10),
    forward: Vector2 = new Vector2(1, 1),
    speed: number = 5
  ) {
    super(position.x, position.y)
    this.forward = forward
    this.speed = speed

    this.radius = 10
    this.color = '#fff'
  }
}

class Paddle extends Vector2 {
  public speed: number
  public width: number
  public height: number
  public color: string

  constructor(position: Vector2) {
    super(position.x, position.y)

    this.width = 12
    this.height = 100
    this.speed = 10
    this.color = '#fff'
  }
}

class Pong {
  private canvas: HTMLCanvasElement
  private context: CanvasRenderingContext2D
  private width: number
  private height: number
  private clock: number | null
  private balls: Ball[]
  private paddles: { left: Paddle; right: Paddle }
  private scores: { left: number; right: number }
  public keys: { [key: string]: boolean }
  public scale: number
  public offset: Vector2
  public side: Side
  public winner: Side | null

  constructor(canvas: HTMLCanvasElement, side: Side) {
    this.canvas = canvas
    this.context = this.canvas.getContext('2d')!
    this.side = side

    this.width = 1200
    this.height = 800
    this.clock = null
    this.balls = []
    this.paddles = {
      left: new Paddle(new Vector2(20, this.height / 2)),
      right: new Paddle(new Vector2(this.width - 20, this.height / 2))
    }
    this.scores = {
      left: 0,
      right: 0
    }
    this.keys = {
      up: false,
      down: false
    }
    this.scale = 1
    this.offset = new Vector2(0, 0)
    this.winner = null

    this.onKeyDown = this.onKeyDown.bind(this)
    this.onKeyUp = this.onKeyUp.bind(this)
  }

  loop = () => {
    if (!this.winner) {
      this.#input()
      this.#physic()
      this.#events()
    }
    this.#draw()
  }

  #drawBackground() {
    this.context.fillStyle = '#111'
    this.context.fillRect(
      this.offset.x,
      this.offset.y,
      this.width * this.scale,
      this.height * this.scale
    )

    this.context.strokeStyle = '#fff'
    this.context.lineWidth = 2 * this.scale
    this.context.beginPath()
    this.context.setLineDash([Math.floor(20 * this.scale)])
    this.context.moveTo(this.offset.x + (this.width / 2) * this.scale, this.offset.y)
    this.context.lineTo(
      this.offset.x + (this.width / 2) * this.scale,
      this.offset.y + this.height * this.scale
    )
    this.context.stroke()
    this.context.closePath()
  }

  #drawBalls() {
    for (const ball of this.balls) {
      this.context.fillStyle = ball.color
      this.context.beginPath()
      this.context.arc(
        this.offset.x + ball.x * this.scale,
        this.offset.y + ball.y * this.scale,
        ball.radius * this.scale,
        0,
        2 * Math.PI
      )
      this.context.fill()
      this.context.closePath()
    }
  }

  #drawPaddles() {
    for (const paddle of [this.paddles.left, this.paddles.right]) {
      this.context.fillStyle = paddle.color
      this.context.fillRect(
        this.offset.x + paddle.x * this.scale - (paddle.width / 2) * this.scale,
        this.offset.y + paddle.y * this.scale - (paddle.height / 2) * this.scale,
        paddle.width * this.scale,
        paddle.height * this.scale
      )
    }
  }

  #drawScores() {
    this.context.fillStyle = '#fff'
    this.context.font = Math.round(48 * this.scale) + 'px monospace'
    this.context.textAlign = 'center'
    this.context.fillText(
      this.scores.left.toString(),
      this.offset.x + (this.width / 2 - 100) * this.scale,
      this.offset.y + 100 * this.scale
    )
    this.context.fillText(
      this.scores.right.toString(),
      this.offset.x + (this.width / 2 + 100) * this.scale,
      this.offset.y + 100 * this.scale
    )
  }

  #drawWinner() {
    let text = 'You ' + (this.winner == this.side ? 'win' : 'lose') + '!'

    this.context.fillStyle = '#fff'
    this.context.font = Math.round(150 * this.scale) + 'px monospace'
    this.context.textAlign = 'center'
    this.context.fillText(
      text,
      this.offset.x + (this.width / 2) * this.scale,
      this.offset.y + (this.height / 2) * this.scale
    )
  }

  #draw() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.#drawBackground()
    this.#drawBalls()
    this.#drawPaddles()
    this.#drawScores()
    if (this.winner) {
      this.#drawWinner()
    }
  }

  #ballHit(ball: Ball, paddle: Paddle, direction: -1 | 1) {
    ball.forward.x = direction * Math.abs(ball.forward.x)
    ball.forward.rotate(
      ((ball.y - paddle.y) / (paddle.height + ball.radius / 2)) * Math.PI * 0.5 * direction
    )
    ball.speed *= 1.1
  }

  #physic() {
    for (const ball of this.balls) {
      ball.x += ball.speed * ball.forward.x
      ball.y += ball.speed * ball.forward.y

      if (ball.y + ball.radius >= this.height || ball.y - ball.radius <= 0) {
        ball.forward.y *= -1
      }

      if (
        ball.x - ball.radius <= this.paddles.left.x + this.paddles.left.width / 2 &&
        ball.y + ball.radius > this.paddles.left.y - this.paddles.left.height / 2 &&
        ball.y - ball.radius < this.paddles.left.y + this.paddles.left.height / 2
      ) {
        this.#ballHit(ball, this.paddles.left, 1)
      }

      if (
        ball.x + ball.radius >= this.paddles.right.x - this.paddles.right.width / 2 &&
        ball.y + ball.radius > this.paddles.right.y - this.paddles.right.height / 2 &&
        ball.y - ball.radius < this.paddles.right.y + this.paddles.right.height / 2
      ) {
        this.#ballHit(ball, this.paddles.right, -1)
      }
    }
  }

  #input() {
    if (this.keys.up) {
      if (this.paddles[this.side].y - this.paddles[this.side].height / 2 > 0) {
        this.paddles[this.side].y -= this.paddles[this.side].speed
      }
    } else if (this.keys.down) {
      if (this.paddles[this.side].y + this.paddles[this.side].height / 2 < this.height) {
        this.paddles[this.side].y += this.paddles[this.side].speed
      }
    }
  }

  #addScore(side: Side, score: number) {
    this.scores[side] += score
    this.balls = []
    if (this.scores[side] < 5) {
      this.startRound()
    } else {
      this.winner = side
    }
  }

  #events() {
    for (const ball of this.balls) {
      if (ball.x - ball.radius <= 0) {
        this.#addScore('right', 1)
      } else if (ball.x + ball.radius >= this.width) {
        this.#addScore('left', 1)
      }
    }
  }

  startRound() {
    let ball = new Ball(new Vector2(this.width / 2, this.height / 2), new Vector2(0, 1))
    let side = Math.random() > 0.5 ? -1 : 1
    let degrees = (Math.random() * 100 + 40) * side
    ball.forward.rotate(degrees * (Math.PI / 180))
    this.balls.push(ball)
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key == 'w' || event.key == 'ArrowUp') {
      this.keys.up = true
    } else if (event.key == 's' || event.key == 'ArrowDown') {
      this.keys.down = true
    }
  }

  onKeyUp(event: KeyboardEvent) {
    if (event.key == 'w' || event.key == 'ArrowUp') {
      this.keys.up = false
    } else if (event.key == 's' || event.key == 'ArrowDown') {
      this.keys.down = false
    }
    // DEV
    else if (event.key == ' ') {
      this.side = this.side == 'left' ? 'right' : 'left'
    }
  }

  onResize() {
    let scaleWidth = this.canvas.width / this.width
    let scaleHeight = this.canvas.height / this.height
    this.scale = scaleWidth > scaleHeight ? scaleHeight : scaleWidth
    this.offset.x = (this.canvas.width - this.width * this.scale) / 2
    this.offset.y = (this.canvas.height - this.height * this.scale) / 2
  }

  start() {
    this.clock = window.setInterval(this.loop, 1000 / 60)
    this.startRound()
  }

  stop() {
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
    onResize() {
      this.canvas!.width = this.canvas!.offsetWidth
      this.canvas!.height = this.canvas!.offsetHeight
      this.pong!.onResize()
    }
  },

  mounted() {
    this.canvas = this.$el as HTMLCanvasElement
    this.pong = new Pong(this.canvas, 'right')

    window.addEventListener('resize', this.onResize)
    window.addEventListener('keydown', this.pong!.onKeyDown)
    window.addEventListener('keyup', this.pong!.onKeyUp)
    this.onResize()

    this.pong.start()
  },

  unmounted() {
    this.pong!.stop()
    window.removeEventListener('resize', this.onResize)
    window.removeEventListener('keydown', this.pong!.onKeyDown)
    window.removeEventListener('keyup', this.pong!.onKeyUp)
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

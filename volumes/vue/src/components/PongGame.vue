<script lang="ts">
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

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.context = this.canvas.getContext('2d')!

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

    this.onKeyDown = this.onKeyDown.bind(this)
    this.onKeyUp = this.onKeyUp.bind(this)
  }

  #loop = () => {
    this.#input()
    this.#physic()
    this.#events()
    this.#draw()
  }

  #scale() {
    let scaleWidth = this.canvas.width / this.width
    let scaleHeight = this.canvas.height / this.height
    return scaleWidth > scaleHeight ? scaleHeight : scaleWidth
  }

  #drawBackground(scale: number, offset: Vector2) {
    this.context.fillStyle = '#111'
    this.context.fillRect(offset.x, offset.y, this.width * scale, this.height * scale)

    this.context.strokeStyle = '#fff'
    this.context.lineWidth = 2 * scale
    this.context.beginPath()
    this.context.setLineDash([Math.floor(20 * scale)])
    this.context.moveTo(offset.x + (this.width / 2) * scale, offset.y)
    this.context.lineTo(offset.x + (this.width / 2) * scale, offset.y + this.height * scale)
    this.context.stroke()
    this.context.closePath()
  }

  #drawBalls(scale: number, offset: Vector2)
  {
    for (const ball of this.balls) {
      this.context.fillStyle = ball.color
      this.context.beginPath()
      this.context.arc(
        offset.x + ball.x * scale,
        offset.y + ball.y * scale,
        ball.radius * scale,
        0,
        2 * Math.PI
      )
      this.context.fill()
      this.context.closePath()
    }
  }

  #drawPaddles(scale: number, offset: Vector2) {
    for (const paddle of [this.paddles.left, this.paddles.right]) {
      this.context.fillStyle = paddle.color
      this.context.fillRect(
        offset.x + paddle.x * scale - (paddle.width / 2) * scale,
        offset.y + paddle.y * scale - (paddle.height / 2) * scale,
        paddle.width * scale,
        paddle.height * scale
      )
    }
  }

  #drawScores(scale: number, offset: Vector2) {
    this.context.fillStyle = '#fff'
    this.context.font = Math.round(48 * scale) + 'px monospace'
    this.context.textAlign = 'center'
    this.context.fillText(
      this.scores.left.toString(),
      offset.x + (this.width / 2 - 100) * scale,
      offset.y + 100 * scale
    )
    this.context.fillText(
      this.scores.right.toString(),
      offset.x + (this.width / 2 + 100) * scale,
      offset.y + 100 * scale
    )
  }

  #draw() {
    let scale = this.#scale()
    let offset: Vector2 = new Vector2(
      (this.canvas.width - this.width * scale) / 2,
      (this.canvas.height - this.height * scale) / 2
    )

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.#drawBackground(scale, offset)
    this.#drawBalls(scale, offset)
    this.#drawPaddles(scale, offset)
    this.#drawScores(scale, offset)
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
      if (this.paddles.left.y - this.paddles.left.height / 2 > 0) {
        this.paddles.left.y -= this.paddles.left.speed
      }
    } else if (this.keys.down) {
      if (this.paddles.left.y + this.paddles.left.height / 2 < this.height) {
        this.paddles.left.y += this.paddles.left.speed
      }
    }
  }

  #events() {
    for (const ball of this.balls) {
      if (ball.x - ball.radius <= 0) {
        this.scores.right++
        this.balls = []
        if (this.scores.right < 5) {
          this.#startRound()
        } else {
          console.log('right wins')
        }
      } else if (ball.x + ball.radius >= this.width) {
        this.scores.left++
        this.balls = []
        if (this.scores.left < 5) {
          this.#startRound()
        } else {
          console.log('left wins')
        }
      }
    }
  }

  #startRound() {
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
  }

  start() {
    this.clock = window.setInterval(this.#loop, 1000 / 60)
    this.#startRound()
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
    }
  },

  mounted() {
    this.canvas = this.$el as HTMLCanvasElement
    this.pong = new Pong(this.canvas)

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

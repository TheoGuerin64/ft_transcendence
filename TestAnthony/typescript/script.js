var PLAYER_HEIGHT = 100;
var PLAYER_WIDTH = 5;
var PLAYER_SPEED = 1;
var BALL_RADIUS = 5;
var ARROW_UP = 38;
var ARROW_DOWN = 40;
var CanvaWindow = /** @class */ (function () {
    function CanvaWindow(canva) {
        this.canva = canva;
        this.context = this.canva.getContext('2d');
        this.game = {
            player: {
                x: 0,
                y: this.canva.height / 2 - PLAYER_HEIGHT / 2,
                score: 0
            },
            computer: {
                x: 1,
                y: this.canva.height / 2 - PLAYER_HEIGHT / 2,
                score: 0
            },
            ball: {
                x: this.canva.width / 2,
                y: this.canva.height / 2,
                speed: {
                    x: 2,
                    y: 2
                }
            }
        };
    }
    CanvaWindow.prototype.drawBackground = function () {
        // Draw field
        this.context.fillStyle = 'black';
        this.context.fillRect(0, 0, this.canva.width, this.canva.height);
        // Draw middle line
        this.context.strokeStyle = 'white';
        this.context.beginPath();
        this.context.moveTo(this.canva.width / 2, 0);
        this.context.lineTo(this.canva.width / 2, this.canva.height);
        this.context.stroke();
    };
    CanvaWindow.prototype.drawPlayer = function () {
        this.context.fillStyle = 'white';
        this.context.fillRect(0, this.game.player.y, PLAYER_WIDTH, PLAYER_HEIGHT);
        this.context.fillRect(this.canva.width - PLAYER_WIDTH, this.game.computer.y, PLAYER_WIDTH, PLAYER_HEIGHT);
    };
    CanvaWindow.prototype.drawBall = function () {
        this.context.beginPath();
        this.context.fillStyle = 'white';
        this.context.arc(this.game.ball.x, this.game.ball.y, BALL_RADIUS, 0, Math.PI * 2, false);
        this.context.fill();
    };
    CanvaWindow.prototype.play = function () {
        var _this = this;
        this.ballMove();
        this.computerMove();
        this.drawBackground();
        this.drawPlayer();
        this.drawBall();
        requestAnimationFrame(function () { return _this.play(); });
    };
    CanvaWindow.prototype.playerMove = function (event) {
        /*
        mouse
        const canvasLocation = this.canva.getBoundingClientRect();
        const mouseLocation = event.clientY - canvasLocation.y;
        if (mouseLocation < PLAYER_HEIGHT / 2) {
            this.game.player.y = 0;
        } else if (mouseLocation > this.canva.height - PLAYER_HEIGHT / 2) {
            this.game.player.y = this.canva.height - PLAYER_HEIGHT;
        } else {
            this.game.player.y = mouseLocation - PLAYER_HEIGHT / 2;
        }
        */
        if (event.key == "ArrowUp") {
            this.game.player.y -= PLAYER_SPEED;
        }
        else if (event.key == "ArrowDown") {
            this.game.player.y += PLAYER_SPEED;
        }
    };
    CanvaWindow.prototype.computerMove = function () {
        this.game.computer.y += this.game.ball.speed.y * 0.80;
    };
    CanvaWindow.prototype.ballMove = function () {
        if (this.game.ball.y > this.canva.height || this.game.ball.y < 0) {
            this.game.ball.speed.y *= -1;
        }
        if (this.game.ball.x > this.canva.width - PLAYER_WIDTH) {
            this.collide(this.game.computer);
        }
        else if (this.game.ball.x < PLAYER_WIDTH) {
            this.collide(this.game.player);
        }
        this.game.ball.x += this.game.ball.speed.x;
        this.game.ball.y += this.game.ball.speed.y;
    };
    CanvaWindow.prototype.collide = function (player) {
        if (this.game.ball.y < player.y || this.game.ball.y > player.y + PLAYER_HEIGHT) {
            this.game.ball.x = this.canva.width / 2;
            this.game.ball.y = this.canva.height / 2;
            this.game.player.y = this.canva.height / 2 - PLAYER_HEIGHT / 2;
            this.game.computer.y = this.canva.height / 2 - PLAYER_HEIGHT / 2;
            this.game.ball.speed.x = 2;
            if (player.x == 0)
                this.game.computer.score++;
            else
                this.game.player.score++;
            document.getElementById('playerScore').textContent = "Player Score : " + this.game.player.score;
            document.getElementById('computerScore').textContent = "Computer Score : " + this.game.computer.score;
        }
        else {
            this.game.ball.speed.x *= -1.2;
            this.changeDirection(player.y);
        }
    };
    CanvaWindow.prototype.changeDirection = function (playerPosition) {
        var impact = this.game.ball.y - playerPosition - PLAYER_HEIGHT / 2;
        var ratio = 100 / (PLAYER_HEIGHT / 2);
        this.game.ball.speed.y = Math.round(impact * ratio / 10);
    };
    return CanvaWindow;
}());
document.addEventListener('DOMContentLoaded', function () {
    var canva = new CanvaWindow(document.getElementById('canvas'));
    canva.drawBackground();
    document.getElementById('buttonPlay').addEventListener("click", function () {
        document.addEventListener('keydown', function (event) { canva.playerMove(event); });
        //canva.canva.addEventListener('mousemove', function(event) {canva.playerMove(event)});
        canva.play();
    });
});

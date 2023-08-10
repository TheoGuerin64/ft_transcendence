import { Game } from './game.service';
import { Globals } from './globals.service';
import { Injectable } from '@nestjs/common';
import { Player } from './player.service';
import { Server } from 'socket.io';

@Injectable()
export class Ball {
  private speed: number;
  private directionX: number;
  private directionY: number;
  private positionX: number;
  private positionY: number;
  private hitSomething: boolean;

  constructor() {
    this.speed = 0.1;
    this.directionX = Math.random() * (1 - -1) + -1;
    this.directionY = Math.random() * (0.5 - -0.5) + -0.5;
    this.directionX = 1;
    this.directionY = 0;
    this.positionX = 0;
    this.positionY = 0;
    this.hitSomething = false;
  }

  getSpeed(): number {
    return this.speed;
  }
  getPositionX(): number {
    return this.positionX;
  }
  getPositionY(): number {
    return this.positionY;
  }
  getDirectionX(): number {
    return this.directionX;
  }
  getDirectionY(): number {
    return this.directionY;
  }
  getHitSomething(): boolean {
    return this.hitSomething;
  }

  setSpeed(speed: number): void {
    this.speed = speed;
  }
  setPositionX(positionX: number): void {
    this.positionX = positionX;
  }
  setPositionY(positionY: number): void {
    this.positionY = positionY;
  }
  setDirectionX(directionX: number): void {
    this.directionX = directionX;
  }
  setDirectionY(directionY: number): void {
    this.directionY = directionY;
  }
  setHitSomething(hitSomething: boolean): void {
    this.hitSomething = hitSomething;
  }

  static ballMovement(server: Server, game: Game): void {
    if (game.getBall() == null) {
      return;
    }
    this.newBallPosition(server, game);
    server
      .in(game.getGameID())
      .emit(
        'ballMovement',
        game.getBall().getPositionX(),
        game.getBall().getPositionY(),
      );
  }

  private static newBallPosition(server: Server, game: Game): void {
    const ball = game.getBall();

    let newPosX = ball.getPositionX() + ball.getDirectionX() * ball.getSpeed();
    let newPosY = ball.getPositionY() + ball.getDirectionY() * ball.getSpeed();

    if (
      newPosY <= -Globals.collisionBallMapBorder ||
      newPosY >= Globals.collisionBallMapBorder
    ) {
      ball.setDirectionY(-ball.getDirectionY());
      newPosY = Ball.adaptNewPosition(newPosY);
    }
    if (
      newPosX <= -Globals.collisionBallMapBorder ||
      newPosX >= Globals.collisionBallMapBorder
    ) {
      if (this.ballHitPaddle(newPosX, newPosY, game)) {
        ball.setDirectionX(-ball.getDirectionX());
        newPosX = this.adaptNewPosition(newPosX);
      } else {
        this.someoneWinPoint(server, game, newPosX);
        game.setBall(new Ball());
      }
    }

    ball.setPositionX(newPosX);
    ball.setPositionY(newPosY);
  }

  private static ballHitPaddle(
    newPosX: number,
    newPosY: number,
    game: Game,
  ): boolean {
    if (
      (newPosX <= -Globals.collisionBallMapBorder &&
        this.ballAtPlayerHeight(newPosY, game.getPlayerOne())) ||
      (newPosX >= Globals.collisionBallMapBorder &&
        this.ballAtPlayerHeight(newPosY, game.getPlayerTwo()))
    ) {
      return true;
    } else {
      return false;
    }
  }

  private static ballAtPlayerHeight(newPosY: number, player: Player): boolean {
    if (
      newPosY >= player.getPosY() - Globals.playerHeight / 2 &&
      newPosY <= player.getPosY() + Globals.playerHeight / 2
    ) {
      return true;
    } else {
      return false;
    }
  }

  private static adaptNewPosition(newPos: number): number {
    if (newPos <= -Globals.collisionBallMapBorder) {
      newPos = -Globals.collisionBallMapBorder;
    } else if (newPos >= Globals.collisionBallMapBorder) {
      newPos = Globals.collisionBallMapBorder;
    }
    return newPos;
  }

  private static someoneWinPoint(
    server: Server,
    game: Game,
    newPosX: number,
  ): void {
    if (newPosX <= -Globals.collisionBallMapBorder) {
      this.emitWinnerPoint(
        server,
        game.getGameID(),
        game.getPlayerTwo(),
        game.getBall(),
        'PlayerTwoWinPoint',
        'PlayerTwoWinGame',
      );
    } else {
      this.emitWinnerPoint(
        server,
        game.getGameID(),
        game.getPlayerOne(),
        game.getBall(),
        'PlayerOneWinPoint',
        'PlayerOneWinGame',
      );
    }
  }

  private static emitWinnerPoint(
    server: Server,
    gameID: string,
    player: Player,
    ball: Ball,
    messageWinPoint: string,
    messageWinGame: string,
  ): void {
    player.setPoint(player.getPoint() + 1);
    if (player.getPoint() >= 5) {
      server.in(gameID).emit(messageWinGame);
      ball = null;
    } else {
      server.in(gameID).emit(messageWinPoint);
    }
    //emit to the database the result
  }
}

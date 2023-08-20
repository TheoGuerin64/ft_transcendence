import { Ball } from '../classes/ball.class';
import { Game } from '../classes/game.class';
import { Injectable } from '@nestjs/common';
import { Player } from '../classes/player.class';
import { Server } from 'socket.io';
import {
  collisionBallCentralCube,
  collisionBallMapBorder,
  IncreaseBallSpeed,
  playerHeight,
} from '../globals';

@Injectable()
export class BallService {
  static ballMovement(server: Server, game: Game): boolean {
    const someoneWinPoint = this.newBallPosition(server, game);
    server
      .in(game.getGameID())
      .emit(
        'ballMovement',
        game.getBall().getPositionX(),
        game.getBall().getPositionY(),
      );
    server.in(game.getGameID()).emit('message');
    return someoneWinPoint;
  }

  private static newBallPosition(server: Server, game: Game): boolean {
    const ball = game.getBall();

    let newPosX = ball.getPositionX() + ball.getDirectionX() * ball.getSpeed();
    let newPosY = ball.getPositionY() + ball.getDirectionY() * ball.getSpeed();
    let someoneWinPoint = false;

    if (
      newPosY <= -collisionBallMapBorder ||
      newPosY >= collisionBallMapBorder
    ) {
      ball.setDirectionY(-ball.getDirectionY());
      newPosY = this.adaptNewPosition(newPosY, collisionBallMapBorder);
    }
    if (
      newPosX <= -collisionBallMapBorder ||
      newPosX >= collisionBallMapBorder
    ) {
      if (this.ballHitPaddle(newPosX, newPosY, game)) {
        ball.setDirectionX(-ball.getDirectionX());
        ball.setSpeed(ball.getSpeed() + IncreaseBallSpeed);
        newPosX = this.adaptNewPosition(newPosX, collisionBallMapBorder);
      } else {
        someoneWinPoint = true;
      }
    }

    if (game.getGameType() === 'custom') {
      this.checkCentralCube(ball, { x: newPosX, y: newPosY });
    }
    ball.setPositionX(newPosX);
    ball.setPositionY(newPosY);

    return someoneWinPoint;
  }

  private static checkCentralCube(
    ball: Ball,
    newPos: { x: number; y: number },
  ) {
    if (this.ballHitCube(newPos.x, newPos.y)) {
      this.updateDirection(ball);
      newPos.x = this.adaptNewPosition(newPos.x, collisionBallCentralCube);
      newPos.y = this.adaptNewPosition(newPos.y, collisionBallCentralCube);
    }
  }

  private static ballHitPaddle(
    newPosX: number,
    newPosY: number,
    game: Game,
  ): boolean {
    if (
      newPosX <= -collisionBallMapBorder &&
      this.ballAtPlayerHeight(newPosY, game.getPlayerOne())
    ) {
      return true;
    } else if (
      newPosX >= collisionBallMapBorder &&
      this.ballAtPlayerHeight(newPosY, game.getPlayerTwo())
    ) {
      return true;
    } else {
      return true; //false
    }
  }

  private static ballAtPlayerHeight(newPosY: number, player: Player): boolean {
    if (
      newPosY >= player.getPosY() - playerHeight / 2 &&
      newPosY <= player.getPosY() + playerHeight / 2
    ) {
      return true;
    } else {
      return false;
    }
  }

  private static ballHitCube(newPosX: number, newPosY: number): boolean {
    if (
      newPosX >= -collisionBallCentralCube &&
      newPosX <= collisionBallCentralCube &&
      newPosY >= -collisionBallCentralCube &&
      newPosY <= collisionBallCentralCube
    ) {
      return true;
    } else {
      return false;
    }
  }
  private static adaptNewPosition(
    newPos: number,
    entityCollide: number,
  ): number {
    if (newPos <= -entityCollide) {
      newPos = -entityCollide;
    } else if (newPos >= entityCollide) {
      newPos = entityCollide;
    }
    return newPos;
  }

  private static updateDirection(ball: Ball) {
    if (ball.getPositionX() <= -collisionBallCentralCube) {
      ball.setDirectionX(-Math.abs(ball.getDirectionX()));
    } else if (ball.getPositionX() >= collisionBallCentralCube) {
      ball.setDirectionX(Math.abs(ball.getDirectionX()));
    }
    if (ball.getPositionY() <= -collisionBallCentralCube) {
      ball.setDirectionY(-Math.abs(ball.getDirectionY()));
    } else if (ball.getPositionY() >= collisionBallCentralCube) {
      ball.setDirectionY(Math.abs(ball.getDirectionY()));
    }
  }
}

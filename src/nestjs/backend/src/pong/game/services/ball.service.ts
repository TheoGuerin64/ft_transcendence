import { Game } from '../classes/game.class';
import { Injectable } from '@nestjs/common';
import { Player } from '../classes/player.class';
import { Server } from 'socket.io';
import {
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
      newPosY = this.adaptNewPosition(newPosY);
    }
    if (
      newPosX <= -collisionBallMapBorder ||
      newPosX >= collisionBallMapBorder
    ) {
      if (this.ballHitPaddle(newPosX, newPosY, game)) {
        ball.setDirectionX(-ball.getDirectionX());
        ball.setSpeed(ball.getSpeed() + IncreaseBallSpeed);
        newPosX = this.adaptNewPosition(newPosX);
      } else {
        someoneWinPoint = true;
      }
    }

    ball.setPositionX(newPosX);
    ball.setPositionY(newPosY);
    return someoneWinPoint;
  }

  private static ballHitPaddle(
    newPosX: number,
    newPosY: number,
    game: Game,
  ): boolean {
    if (
      (newPosX <= -collisionBallMapBorder &&
        this.ballAtPlayerHeight(newPosY, game.getPlayerOne())) ||
      (newPosX >= collisionBallMapBorder &&
        this.ballAtPlayerHeight(newPosY, game.getPlayerTwo()))
    ) {
      return true;
    } else {
      return false;
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

  private static adaptNewPosition(newPos: number): number {
    if (newPos <= -collisionBallMapBorder) {
      newPos = -collisionBallMapBorder;
    } else if (newPos >= collisionBallMapBorder) {
      newPos = collisionBallMapBorder;
    }
    return newPos;
  }
}

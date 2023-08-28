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
  /**
   * update the ball position
   * and emit this information to the players in the game
   * @param server socket server
   * @param game game instance
   */

  static ballMovement(server: Server, game: Game): void {
    this.newBallPosition(server, game);
    server
      .in(game.getGameID())
      .emit(
        'ballMovement',
        game.getBall().getPositionX(),
        game.getBall().getPositionY(),
      );
  }

  /**
   * update ball position on axes X and Y
   * by adding to its position its direction multiplied by its speed
   * @param server socket server
   * @param game game instance
   */
  private static newBallPosition(server: Server, game: Game): void {
    const ball = game.getBall();

    const newPosX =
      ball.getPositionX() + ball.getDirectionX() * ball.getSpeed();
    const newPosY =
      ball.getPositionY() + ball.getDirectionY() * ball.getSpeed();

    this.updateDirection(game, ball, { x: newPosX, y: newPosY });

    ball.setPositionX(newPosX);
    ball.setPositionY(newPosY);
  }

  /**
   * adapt the direction and the position if the ball hit a wall, a paddle,
   * or the cube if the game is on custom type
   * @param game game instance
   * @param ball ball instance
   * @param newPos new position on X and Y axes of the ball
   */
  private static updateDirection(
    game: Game,
    ball: Ball,
    newPos: { x: number; y: number },
  ) {
    if (
      newPos.y <= -collisionBallMapBorder ||
      newPos.y >= collisionBallMapBorder
    ) {
      ball.setDirectionY(-ball.getDirectionY());
      newPos.y = this.adaptNewPosition(newPos.y, collisionBallMapBorder);
    }
    if (
      (newPos.x <= -collisionBallMapBorder ||
        newPos.x >= collisionBallMapBorder) &&
      this.ballHitPaddle(game, newPos)
    ) {
      this.updateDirectionOnPaddle(game, ball, newPos);
    }
    if (game.getGameType() === 'custom') {
      this.checkCentralCube(ball, newPos);
    }
  }

  /**
   * adapt the direction and the position if the ball hit a paddle
   * and increase its speed
   * @param game game instance
   * @param ball ball instance
   * @param newPos new position on X and Y axes of the ball
   */
  private static updateDirectionOnPaddle(
    game: Game,
    ball: Ball,
    newPos: { x: number; y: number },
  ): void {
    //ball.setDirectionY(this.calculateDirectionY(game, ball));
    ball.setDirectionX(-ball.getDirectionX());
    ball.setSpeed(ball.getSpeed() + IncreaseBallSpeed);
    newPos.x = this.adaptNewPosition(newPos.x, collisionBallMapBorder);
  }

  /**
   * calculate new direction Y by calculating where did the ball hit the paddle
   * and multiplying it by the the orientation,
   * depending if the ball hit the top or the bot of the paddle
   * @param game game instance
   * @param ball ball instance
   * @returns the new direction Y
   */
  private static calculateDirectionY(game: Game, ball: Ball): number {
    const impact =
      game.getBall().getPositionY() - game.getPlayerTwo().getPosY();
    const vectorValue = (((100 / (playerHeight / 2)) * impact) / 100) % 1;
    let vectorOrientation;
    if (
      (ball.getPositionX() < 0 &&
        game.getBall().getPositionY() < game.getPlayerOne().getPosY()) ||
      (ball.getPositionX() > 0 &&
        game.getBall().getPositionY() < game.getPlayerTwo().getPosY())
    ) {
      vectorOrientation = -1;
    } else {
      vectorOrientation = 1;
    }
    return vectorOrientation * Math.abs(vectorValue);
  }

  /**
   * check if the ball hit the central cube
   * and adapt possition and direction based on it
   * @param ball ball instance
   * @param newPos new position on X and Y axes of the ball
   */
  private static checkCentralCube(
    ball: Ball,
    newPos: { x: number; y: number },
  ) {
    if (this.ballHitCube(newPos)) {
      this.updateDirectionOnCube(ball);
      newPos.x = this.adaptNewPosition(newPos.x, collisionBallCentralCube);
      newPos.y = this.adaptNewPosition(newPos.y, collisionBallCentralCube);
    }
  }

  /**
   * check if the ball hit the paddle or not
   * @param game game instance
   * @param newPos new position on X and Y axes of the ball
   * @returns boolean telling if the ball hit the paddle or not
   */
  static ballHitPaddle(game: Game, newPos: { x: number; y: number }): boolean {
    if (
      newPos.x <= -collisionBallMapBorder &&
      this.ballAtPlayerHeight(game.getPlayerOne(), newPos.y)
    ) {
      return true;
    } else if (
      newPos.x >= collisionBallMapBorder &&
      this.ballAtPlayerHeight(game.getPlayerTwo(), newPos.y)
    ) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * check if the ball is at player height
   * @param player player to compare
   * @param newPosY new position Y of the ball
   * @returns boolean telling if the ball is at player height or not
   */
  private static ballAtPlayerHeight(player: Player, newPosY: number): boolean {
    if (
      newPosY >= player.getPosY() - playerHeight / 2 &&
      newPosY <= player.getPosY() + playerHeight / 2
    ) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * check if the ball hit the paddle
   * @param newPos new position on X and Y axes of the ball
   * @returns boolean telling if the ball hit the paddle or not
   */
  private static ballHitCube(newPos: { x: number; y: number }): boolean {
    if (
      newPos.x >= -collisionBallCentralCube &&
      newPos.x <= collisionBallCentralCube &&
      newPos.y >= -collisionBallCentralCube &&
      newPos.y <= collisionBallCentralCube
    ) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * adapt position X or Y to avoid the ball to leave the field
   * @param newPos position X or Y of the ball
   * @param entityCollide border of the cube or the wall
   * @returns new position adapted
   */
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

  /**
   * adapt the direction of the ball if it hit the cube
   * @param ball ball instance
   */
  private static updateDirectionOnCube(ball: Ball) {
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

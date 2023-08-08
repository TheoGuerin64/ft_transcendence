import { Ball } from './ball.service';
import { Injectable } from '@nestjs/common';
import { Player } from './player.service';
@Injectable()
export class Game {
  private readonly gameID: string;
  private readonly gameType: string;
  private readonly playerOne: Player;
  private readonly playerTwo: Player;
  private ball: Ball;
  private id = 0;

  constructor(gameType: string, playerOne: Player, playerTwo: Player) {
    this.id += 1;
    this.gameID = this.id.toString();
    this.gameType = gameType;
    this.playerOne = playerOne;
    this.playerOne.setPoint(0);
    this.playerTwo = playerTwo;
    this.playerTwo.setPoint(0);
    this.ball = new Ball();
  }

  getGameID(): string {
    return this.gameID;
  }
  getGameType(): string {
    return this.gameType;
  }
  getPlayerOne(): Player {
    return this.playerOne;
  }
  getPlayerTwo(): Player {
    return this.playerTwo;
  }
  getBall(): Ball {
    return this.ball;
  }

  setBall(ball: Ball): void {
    this.ball = ball;
  }
}

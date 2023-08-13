import { Ball } from './ball.class';
import { Player } from './player.class';

export class Game {
  private readonly gameID: string;
  private readonly gameType: string;
  private readonly playerOne: Player;
  private readonly playerTwo: Player;
  private ball: Ball;
  private id = 0;
  private intervalID: NodeJS.Timer;

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
  getIntervalID(): NodeJS.Timer {
    return this.intervalID;
  }

  setBall(ball: Ball): void {
    this.ball = ball;
  }
  setIntervalID(intervalID: NodeJS.Timer): void {
    this.intervalID = intervalID;
  }
}

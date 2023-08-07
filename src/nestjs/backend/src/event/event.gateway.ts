import { Server, Socket } from 'socket.io';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

class Player {
  private readonly login: string;
  private readonly socketID: string;
  private posX: number;
  private posY: number;
  private point: number;

  constructor(login: string, socketID: string) {
    this.login = login;
    this.socketID = socketID;
    this.posX = 0;
    this.posY = 0;
    this.point = 0;
  }

  getLogin(): string {
    return this.login;
  }
  getSocketID(): string {
    return this.socketID;
  }
  getPosX(): number {
    return this.posX;
  }
  getPosY(): number {
    return this.posY;
  }
  getpoint(): number {
    return this.point;
  }
  setPosX(newPosX: number): void {
    this.posX = newPosX;
  }
  setPosY(newPosY: number): void {
    this.posY = newPosY;
  }
  setPoint(point: number): void {
    this.point = point;
  }
}

class Ball {
  private speed: number;
  private directionX: number;
  private directionY: number;
  private positionX: number;
  private positionY: number;
  private hitSomething: boolean;

  constructor() {
    this.speed = 0.01;
    this.directionX = Math.random() * (0.5 - -0.5) + -0.5;
    this.directionY = Math.random() * (1 - -1) + -1;
    this.positionX = 0;
    this.positionY = 0;
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
}
class Game {
  private readonly gameID: string;
  private readonly gameType: string;
  private readonly playerOne: Player;
  private readonly playerTwo: Player;
  private readonly ball: Ball;

  constructor(gameType: string, playerOne: Player, playerTwo: Player) {
    this.gameID = playerTwo.getSocketID();
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
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const updateDirectionX = (ball: Ball, collide: string): void => {
  let newPosition;
  if (collide == 'Wall') {
    if (ball.getPositionX() - 0.15 / 2 <= -2) {
      newPosition = -2 + 0.15 / 2;
    } else {
      newPosition = 2 - 0.15 / 2;
    }
  } else {
    if (ball.getPositionX() - 0.15 / 2 <= -1.5) {
      newPosition = -1.5 + 0.15 / 2;
    } else {
      newPosition = 1.5 - 0.15 / 2;
    }
  }
  ball.setPositionX(newPosition);
  ball.setDirectionX(-ball.getDirectionX());
  ball.setHitSomething(true);
};
const updateDirectionY = (ball: Ball, collide: string): void => {
  let newPosition;
  if (collide == 'Wall') {
    if (ball.getPositionY() - 0.15 / 2 <= -2) {
      newPosition = -2 + 0.15 / 2;
    } else {
      newPosition = 2 - 0.15 / 2;
    }
  } else {
    if (ball.getPositionY() - 0.15 / 2 <= -1.5) {
      newPosition = -1.5 + 0.15 / 2;
    } else {
      newPosition = 1.5 - 0.15 / 2;
    }
  }
  ball.setPositionY(newPosition);
  ball.setDirectionY(-ball.getDirectionY());
  ball.setHitSomething(true);
};

const HitPlayer = (
  ball: Ball,
  playerOne: Player,
  playerTwo: Player,
): boolean => {
  console.log('PlayerOneX', playerOne.getPosX());
  if (
    ball.getPositionX() < 0 &&
    ball.getPositionY() >= playerOne.getPosY() - 0.25 &&
    ball.getPositionY() <= playerOne.getPosY() + 0.25
  ) {
    return true;
  } else if (
    ball.getPositionX() > 0 &&
    ball.getPositionY() >= playerTwo.getPosY() - 0.25 &&
    ball.getPositionY() <= playerTwo.getPosY() + 0.25
  ) {
    return true;
  }
  return false;
};
@WebSocketGateway({ cors: true })
export class EventGateway {
  @WebSocketServer()
  server: Server;

  Players: Player[] = [];
  PlayersNormalQueue: Player[] = [];
  PlayersCustomQueue: Player[] = [];
  Games: Game[] = [];

  step = 0.1;
  LengthPlayer = 0.5;
  lengthBall = 0.15;
  border = 2;

  @SubscribeMessage('connection')
  connection(
    @MessageBody() login: string,
    @ConnectedSocket() socket: Socket,
  ): void {
    const newPlayer = new Player(login, socket.id);
    const indexPlayer = this.Players.findIndex(
      (element) => element.getLogin() === newPlayer.getLogin(),
    );
    if (indexPlayer == -1) {
      this.Players.push(newPlayer);
      console.log('connect', this.Players);
    } else {
      socket.emit('alreadyConnect');
    }
  }

  //refresh page => socket disconnect
  @SubscribeMessage('disconnecting')
  disconnect(
    @MessageBody() data: string,
    @ConnectedSocket() socket: Socket,
  ): void {
    const index: number = this.Players.findIndex(
      (element) => element.getSocketID() == socket.id,
    );
    if (index == -1) {
      return;
    }
    const playerDisconnected = this.Players[index];
    this.Players = this.Players.filter(
      (element) => element.getSocketID() != socket.id,
    );
    this.PlayersNormalQueue = this.PlayersNormalQueue.filter(
      (element) => element.getSocketID() != socket.id,
    );
    socket.broadcast.emit('playerDisconnected', playerDisconnected.getLogin());
  }

  //change page(ex : return home) => socket doesn't disconnect
  @SubscribeMessage('unconnection')
  unconnection(
    @MessageBody() login: string,
    @ConnectedSocket() socket: Socket,
  ): void {
    this.Players = this.Players.filter(
      (element) => element.getSocketID() != socket.id,
    );
    this.PlayersNormalQueue = this.PlayersNormalQueue.filter(
      (element) => element.getSocketID() != socket.id,
    );
    socket.broadcast.emit('playerDisconnected', login);
  }

  @SubscribeMessage('joinNormalQueue')
  joinNormalQueue(
    @MessageBody() login: string,
    @ConnectedSocket() socket: Socket,
  ): void {
    const indexPlayer = this.Players.findIndex(
      (element) => element.getLogin() === login,
    );
    if (indexPlayer == -1) {
      return;
    }
    const indexPlayerQueue = this.PlayersNormalQueue.findIndex(
      (element) => element.getLogin() === login,
    );
    if (indexPlayerQueue != -1) {
      socket.emit('alreadyInQueue');
      return;
    }
    const firstPlayer = this.Players[indexPlayer];
    if (this.PlayersNormalQueue.length >= 1) {
      const secondPlayer = this.PlayersNormalQueue.pop();
      const newGame = new Game('NormalGame', firstPlayer, secondPlayer);
      this.Games.push(newGame);
      socket
        .to(secondPlayer.getSocketID())
        .emit('gameStarted', JSON.stringify(newGame));
      socket.emit('gameStarted', JSON.stringify(newGame));
    } else {
      this.PlayersNormalQueue.push(firstPlayer);
    }
  }

  @SubscribeMessage('movementPlayer')
  movementPlayer(
    @MessageBody() data: { login: string; keyCode: string },
  ): void {
    const index = this.Players.findIndex(
      (element) => element.getLogin() === data[0],
    );
    if (index == -1) {
      return;
    }
    const Player = this.Players[index];
    const offSet = this.LengthPlayer / 2 + this.step;
    if (data[1] == 'w') {
      if (Player.getPosY() + offSet < this.border) {
        Player.setPosY(Player.getPosY() + this.step);
      } else {
        Player.setPosY(this.border - this.LengthPlayer / 2);
      }
    } else if (data[1] == 's') {
      if (Player.getPosY() - offSet > -this.border) {
        Player.setPosY(Player.getPosY() - this.step);
      } else {
        Player.setPosY(-this.border + this.LengthPlayer / 2);
      }
    } else if (data[1] == 'a') {
      if (Player.getPosX() - offSet > -this.border) {
        Player.setPosX(Player.getPosX() - this.step);
      } else {
        Player.setPosX(-this.border + this.LengthPlayer / 2);
      }
    } else if (data[1] == 'd') {
      if (Player.getPosX() + offSet < this.border) {
        Player.setPosX(Player.getPosX() + this.step);
      } else {
        Player.setPosX(this.border - this.LengthPlayer / 2);
      }
    }
    this.server.emit('someoneMoved', data[1], Player);
  }

  @SubscribeMessage('movementBall')
  async movementBall(@ConnectedSocket() socket: Socket): Promise<void> {
    await sleep(15);
    //need to find the good matchs
    const ball = this.Games[0].getBall();
    const playerOne = this.Games[0].getPlayerOne();
    const playerTwo = this.Games[0].getPlayerTwo();
    ball.setHitSomething(false);
    ball.setPositionX(
      ball.getPositionX() + ball.getDirectionX() * ball.getSpeed(),
    );
    ball.setPositionY(
      ball.getPositionY() + ball.getDirectionY() * ball.getSpeed(),
    );

    if (
      ball.getPositionX() - this.lengthBall / 2 <= -this.border ||
      ball.getPositionX() + this.lengthBall / 2 >= this.border
    ) {
      updateDirectionX(ball, 'Wall');
    }
    if (
      ball.getPositionY() - this.lengthBall / 2 <= -this.border ||
      ball.getPositionY() + this.lengthBall / 2 >= this.border
    ) {
      updateDirectionY(ball, 'Wall');
    }
    const offSet = this.border - this.LengthPlayer;
    if (
      (ball.getPositionX() - this.lengthBall / 2 <= -offSet ||
        ball.getPositionX() + this.lengthBall / 2 >= offSet) &&
      HitPlayer(ball, playerOne, playerTwo)
    ) {
      console.log('hit player');
      updateDirectionX(ball, 'Player');
    }
    if (ball.getHitSomething()) {
      ball.setSpeed(ball.getSpeed() + 0.000001);
    }
    socket.emit('movementBall', ball.getPositionX(), ball.getPositionY());
  }
}
//reset7

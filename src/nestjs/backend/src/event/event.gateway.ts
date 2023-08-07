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
    this.directionY = Math.random() * (1 - -1) + -1;
    this.directionX = Math.random() * (0.5 - -0.5) + -0.5;
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
const updateDirectionX = (ball: Ball, newPosition: number): void => {
  ball.setPositionX(newPosition);
  ball.setDirectionX(-ball.getDirectionX());
  ball.setHitSomething(true);
};
const updateDirectionY = (ball: Ball, newPosition: number): void => {
  ball.setPositionY(newPosition);
  ball.setDirectionY(-ball.getDirectionY());

  ball.setHitSomething(true);
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
  DemiLengthSquare = 0.25;
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
    const offSet = this.DemiLengthSquare + this.step;
    if (data[1] == 'w' && Player.getPosY() + offSet < this.border) {
      Player.setPosY(Player.getPosY() + this.step);
    } else if (data[1] == 'a' && Player.getPosX() - offSet > -this.border) {
      Player.setPosX(Player.getPosX() - this.step);
    } else if (data[1] == 's' && Player.getPosY() - offSet > -this.border) {
      Player.setPosY(Player.getPosY() - this.step);
    } else if (data[1] == 'd' && Player.getPosX() + offSet < this.border) {
      Player.setPosX(Player.getPosX() + this.step);
    }
    this.server.emit('someoneMoved', data[1], Player);
  }

  @SubscribeMessage('movementBall')
  async movementBall(@ConnectedSocket() socket: Socket): Promise<void> {
    await sleep(15);
    const ball = this.Games[0].getBall();
    ball.setHitSomething(false);
    ball.setPositionX(
      ball.getPositionX() + ball.getDirectionX() * ball.getSpeed(),
    );
    ball.setPositionY(
      ball.getPositionY() + ball.getDirectionY() * ball.getSpeed(),
    );

    //cleanable
    if (ball.getPositionX() <= -2) {
      updateDirectionX(ball, -2);
    } else if (ball.getPositionX() >= 2) {
      updateDirectionX(ball, 2);
    }
    if (ball.getPositionY() <= -2) {
      updateDirectionY(ball, -2);
    } else if (ball.getPositionY() >= 2) {
      updateDirectionY(ball, 2);
    }
    if (
      ball.getPositionX() <= -1.5 &&
      this.Games[0].getPlayerOne().getPosY() - 1 <= ball.getPositionY() &&
      this.Games[0].getPlayerOne().getPosY() + 1 >= ball.getPositionY()
    ) {
      console.log('player hit');
      updateDirectionX(ball, -1.5);
    } else if (
      ball.getPositionX() >= 1.5 &&
      this.Games[0].getPlayerOne().getPosY() - 1 <= ball.getPositionY() &&
      this.Games[0].getPlayerOne().getPosY() + 1 >= ball.getPositionY()
    ) {
      updateDirectionX(ball, 1.5);
      console.log('player hit');
    }
    if (ball.getHitSomething()) {
      ball.setSpeed(ball.getSpeed() + 0.000001);
    }
    socket.emit('movementBall', ball.getPositionX(), ball.getPositionY());
  }
}
//reset7

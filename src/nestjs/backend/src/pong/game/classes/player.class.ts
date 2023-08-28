export class Player {
  private readonly login: string;
  private readonly username: string;
  private readonly socketID: string;
  private posX: number;
  private posY: number;
  private point: number;
  private lastKeyType: string[];
  private intervalID: NodeJS.Timer[];

  constructor(login: string, username: string, socketID: string) {
    this.login = login;
    this.username = username;
    this.socketID = socketID;
    this.posX = 0;
    this.posY = 0;
    this.point = 0;
    this.lastKeyType = ['keyup', 'keyup'];
    this.intervalID = [null, null];
  }

  getLogin(): string {
    return this.login;
  }
  getUsername(): string {
    return this.username;
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
  getPoint(): number {
    return this.point;
  }
  getLastKeyType(index: number): string {
    return this.lastKeyType[index];
  }
  getIntervalID(index: number): NodeJS.Timer {
    return this.intervalID[index];
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
  setLastKeyType(index: number, lastKeyType: string) {
    this.lastKeyType[index] = lastKeyType;
  }
  setIntervalID(index: number, intervalID: NodeJS.Timer): void {
    this.intervalID[index] = intervalID;
  }

  addOnePoint(): void {
    this.point += 1;
  }
}

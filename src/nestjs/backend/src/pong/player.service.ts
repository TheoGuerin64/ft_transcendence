import { Globals } from './globals.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Player {
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
  getPoint(): number {
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

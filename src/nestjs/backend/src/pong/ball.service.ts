import { Injectable } from '@nestjs/common';
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
}

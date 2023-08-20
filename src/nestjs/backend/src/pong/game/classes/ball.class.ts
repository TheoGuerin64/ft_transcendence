import { ballBaseSpeed } from '../globals';

export class Ball {
  private speed: number;
  private directionX: number;
  private directionY: number;
  private positionX: number;
  private positionY: number;

  constructor(gameType: string) {
    this.speed = ballBaseSpeed;
    this.directionX = Math.random() * (1 - -1) + -1;
    this.directionY = Math.random() * (1 - -1) + -1;
    this.positionX = 0;
    if (gameType === 'normal') {
      this.positionY = 0;
    } else if (gameType === 'custom') {
      this.positionY = 1.5;
    }
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
}

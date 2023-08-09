import { Injectable } from '@nestjs/common';

@Injectable()
export class Globals {
  public readonly stepPlayer = 0.1;
  public readonly heightPlayer = 0.5;
  public readonly widthPlayer = 0.1;
  public readonly lengthBall = 0.15;
  public readonly border = 2;
  public readonly IncreaseBallSpeed = 0.0005;
  public readonly ballCollision = this.border - this.lengthBall / 2;
  public readonly paddleCollision = this.border - this.heightPlayer / 2;
}

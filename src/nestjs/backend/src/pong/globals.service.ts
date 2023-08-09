import { Injectable } from '@nestjs/common';

@Injectable()
export class Globals {
  public static readonly playerStep = 0.1;
  public static readonly playerHeight = 0.5;
  public static readonly playerWidth = 0.1;

  public static readonly ballRadius = 0.15;
  public static readonly ballBaseSpeed = 0.1;
  public static readonly IncreaseBallSpeed = 0.0005;

  public static readonly mapLength = 2;
  public static readonly collisionPlayerMapBorder =
    Globals.mapLength - Globals.playerHeight / 2;
  public static readonly collisionBallMapBorder =
    Globals.mapLength - Globals.ballRadius / 2;
}

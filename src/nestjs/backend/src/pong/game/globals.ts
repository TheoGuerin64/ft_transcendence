export const playerSpeed = 0.05;
export const playerHeight = 0.5;
export const playerWidth = 0.1;

export const ballRadius = 0.15;
export const ballBaseSpeed = 0.03;
export const IncreaseBallSpeed = 0.005;

export const mapLength = 2;
export const collisionPlayerMapBorder = mapLength - playerHeight / 2;
export const collisionBallMapBorder = mapLength - ballRadius / 2;

export const centralCubePosition = { x: 0, y: 0 };
export const centralCubeRadius = 0.5;
export const collisionBallCentralCube =
  centralCubePosition.x + centralCubeRadius + ballRadius / 2;

import { Module } from '@nestjs/common';
import { myGateway } from './gateway';

@Module({
  providers: [myGateway],
})
export class GatewayModule {}

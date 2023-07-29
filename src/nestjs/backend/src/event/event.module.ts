import { EventGateway } from './event.gateway';
import { Module } from '@nestjs/common';
@Module({
  providers: [EventGateway],
})
export class EventsModule {}

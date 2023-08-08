import { EventGateway } from './event.gateway';
import { EventService } from './event.service';
import { Module } from '@nestjs/common';
@Module({
  providers: [EventGateway, EventService],
})
export class EventsModule {}

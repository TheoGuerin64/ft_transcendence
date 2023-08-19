import { Channel } from './channel.entity';
import { ChannelService } from './channel.service';
import { Controller, Get } from '@nestjs/common';

@Controller('channels')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}
  @Get()
  async channelsCreated(): Promise<Channel[]> {
    return await this.channelService.findAll();
  }
}

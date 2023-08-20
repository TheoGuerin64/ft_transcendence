import { Channel } from './channel.entity';
import { ChannelService } from './channel.service';
import { Controller, Get, Param } from '@nestjs/common';
import { Message } from './message.entity';

@Controller('channel')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}
  @Get()
  async channelsCreated(): Promise<Channel[]> {
    return await this.channelService.findAll();
  }

  @Get(':name')
  async channelCreated(@Param('name') name: string): Promise<Channel> {
    return await this.channelService.findOne(name);
  }

  @Get('messages/:name')
  async channelMessages(@Param('name') name: string): Promise<Message[]> {
    return await this.channelService.getMessageHistory(name);
  }
}

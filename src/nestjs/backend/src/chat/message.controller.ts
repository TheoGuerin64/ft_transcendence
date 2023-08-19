// import { ChannelService } from './channel.service';
// import { Controller, Get, Param } from '@nestjs/common';
// import { Message } from './message.entity';

// @Controller('message')
// export class MessageController {
//   constructor(private readonly channelService: ChannelService) {}
//   @Get(':channelName')
//   async messageHistory(
//     @Param('channelName') channelName: any,
//   ): Promise<Message[]> {
//     return await this.messageService.findAll();
//   }
// }

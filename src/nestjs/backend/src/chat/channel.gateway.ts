import { ChannelService } from './channel.service';
import { JwtAuthGuard } from '../auth/auth-jwt.guard';
import { MessageDto } from './channel.pipe';
import { Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { UserService } from 'src/user/user.service';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

@WebSocketGateway({ cors: true })
export class ChannelGateway {
  constructor(
    private readonly channelService: ChannelService,
    private readonly userService: UserService,
  ) {}
  @WebSocketServer()
  server: Server;

  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() messageDto: MessageDto,
    @Req() req: any,
  ): Promise<void> {
    if (messageDto.channelName === '') {
      return;
    }
    this.channelService.addMessage(
      messageDto.content,
      messageDto.channelName,
      req.user.login,
    );
    const user = await this.userService.findOne(req.user.login);
    this.server
      .to(messageDto.channelName)
      .emit('message', messageDto.content, user.name, user.avatar);
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('join-channel')
  async joinChannel(
    @MessageBody() messageDto: MessageDto,
    @ConnectedSocket() client: Socket,
    @Req() req: any,
  ): Promise<void> {
    if (messageDto.channelName === '') {
      return;
    }
    const messageHistory = await this.channelService.getMessageHistory(
      messageDto.channelName,
    );
    if (
      await this.channelService.addMembership(
        messageDto.channelName,
        req.user.login,
      )
    ) {
      client.emit('error', 'You already joined this channel');
    } else {
      await this.channelService.sendHistory(messageDto.channelName, client);
      const user = await this.userService.findOne(req.user.login);
      this.server
        .to(messageDto.channelName)
        .emit('user-joined', user.name, user.avatar);
      client.emit('success', 'You joined the channel');
    }
  }

  @SubscribeMessage('send-history')
  async sendHistoryMessage(
    @MessageBody() data: any,
    @ConnectedSocket() client: any,
  ): Promise<void> {
    await this.channelService.checkConnection(data, client);
    await this.channelService.sendHistory(data.channelName, client);
  }

  @SubscribeMessage('leave-channel')
  async leaveChannel(
    @MessageBody()
    data: any,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    client.leave(data.channelName);

    if (await this.channelService.removeMembership(data)) {
      client.emit('error', 'You already left this channel');
    } else {
      this.server
        .to(data.channelName)
        .emit('user-left', data.username, data.avatar);
      client.emit('success', 'You left the channel');
    }
  }
}

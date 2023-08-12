import { Channel } from './channel.entity';
import { ChannelService } from './channel.service';
import { JwtAuthGuard } from 'src/auth/auth-jwt.guard';
import { Message } from './message/message.entity';
import { MessageService } from './message/message.service';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { User } from 'src/user/user.entity';
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
    private readonly messageService: MessageService,
    private readonly userService: UserService,
    private readonly channelService: ChannelService,
  ) {}
  @WebSocketServer()
  server: Server;

  //@UseGuards(JwtAuthGuard)
  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody()
    data: {
      message: string;
      userName: string;
      login: string;
      channelName: string;
    },
  ): Promise<void> {
    let channel = await this.channelService.findOne(data.channelName);
    console.log('Before push:', channel);
    if (!channel.messages) {
      channel.messages = [];
    }

    let message = this.messageService.create({
      text: data.message,
      createdAt: new Date(),
      sender: data.login,
    });
    await this.messageService.update(message, { channel: channel });
    await this.channelService.addMessage(channel, message);
    //channel.messages.push(message);
    //await this.channelService.save(channel);
    //this.channelService.update(channel, {
    //  messages: channel.messages,
    //  ...message,
    //});
    console.log('After push:', channel);

    //console.log('Channel after message has been added: ');
    //console.log(channel);

    this.server
      .to(data.channelName)
      .emit('message', data.message, data.userName);
  }
  //@UseGuards(JwtAuthGuard)
  @SubscribeMessage('join-channel')
  async joinChannel(
    @MessageBody()
    data: { userName: string; channelName: string; login: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    client.join(data.channelName);
    let user = await this.userService.findOne(data.login);
    let channel = await this.channelService.findOne(data.channelName);
    if (channel) {
      console.log('user:', user);
      channel.users?.push(user);
    } else {
      channel = this.channelService.create({
        name: data.channelName,
        users: [user],
        messages: [],
      });
    }
    this.userService.update(user, { channel: channel });

    this.server
      .to(data.channelName)
      .emit('user-joined', data.userName, data.channelName);
  }
}

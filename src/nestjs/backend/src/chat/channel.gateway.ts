import { Channel } from './channel.entity'
import { ChannelService } from './channel.service'
import { JwtAuthGuard } from 'src/auth/auth-jwt.guard'
import { Message } from './message/message.entity'
import { MessageService } from './message/message.service'
import { Server, Socket } from 'socket.io'
import { UseGuards } from '@nestjs/common'
import { UserService } from 'src/user/user.service'
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
  handleMessage(
    @MessageBody()
    data: {
      message: string;
      userName: string;
      login: string;
      channelName: string;
    },
  ): void {
    // const message = new Message();
    // message.text = data.message;
    // message.createdAt = new Date();
    // this.messageService.create(message);
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
    console.log('Test console log: ', data);
    client.join(data.channelName);
    console.log('Test console log 2: ', data);
    let user = await this.userService.findOne(data.login);
    const newChannel = await this.channelService.create({
      name: data.channelName,
      users: [user],
      messages: [],
    });
    await this.userService.update(user, newChannel);
    this.server.to(data.channelName).emit('user-joined', data.userName);
  }
}

import { async } from 'rxjs';
import { ChannelDto, MembershipDto, MessageDto } from './channel.pipe';
import { ChannelService } from './channel.service';
import { JwtAuthGuard } from '../auth/auth-jwt.guard';
import { MembershipService } from './membership.service';
import { Server, Socket } from 'socket.io';
import { UserService } from 'src/user/user.service';
import { validate } from 'class-validator';
import {
  BadRequestException,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';

@WebSocketGateway({ cors: true })
export class ChannelGateway {
  constructor(
    private readonly channelService: ChannelService,
    private readonly userService: UserService,
    private readonly membershipService: MembershipService,
  ) {}
  @WebSocketServer()
  server: Server;

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() messageDto: MessageDto,
    @ConnectedSocket() client: Socket,
    @Req() req: any,
  ): Promise<void> {
    try {
      await this.channelService.checkConnection(
        messageDto.channelName,
        req.user?.login,
        client,
      );
      if (
        await this.channelService.addMessage(
          messageDto.content,
          messageDto.channelName,
          req.user.login,
          client,
        )
      ) {
        const user = await this.userService.findOne(req.user.login);
        this.server
          .to(messageDto.channelName)
          .emit(
            'message',
            messageDto.content,
            user.name,
            user.avatar,
            user.login,
          );
      }
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('join-channel')
  async joinChannel(
    @MessageBody() channelDto: ChannelDto,
    @ConnectedSocket() client: Socket,
    @Req() req: any,
  ): Promise<void> {
    try {
      const membership = await this.membershipService.findOne(
        channelDto.name,
        req.user.login,
      );
      if (membership) {
        return;
      }
      if (membership?.isBanned == true) {
        client.emit('error', 'You are banned from this channel');
        return;
      }
      if (
        !(await this.channelService.addMembership(
          channelDto,
          req.user.login,
          'member',
          client,
        ))
      ) {
        const user = await this.userService.findOne(req.user.login);
        this.server
          .to(channelDto.name)
          .emit(
            'user-joined',
            user.name,
            user.avatar,
            user.login,
            channelDto.name,
          );
        client.emit('success', 'You joined the channel');
      }
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('leave-channel')
  async leaveChannel(
    @MessageBody() channelDto: ChannelDto,
    @ConnectedSocket() client: Socket,
    @Req() req: any,
  ): Promise<void> {
    try {
      if (
        await this.channelService.removeMembership(
          channelDto.name,
          req.user.login,
          client,
          this.server,
        )
      ) {
        client.emit('error', 'You already left this channel');
      } else {
        const user = await this.userService.findOne(req.user.login);
        client.leave(channelDto.name);
        this.server
          .to(channelDto.name)
          .emit('user-left', user.name, user.avatar, user.login);
        client.emit('success', 'You left the channel');
      }
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('create-channel')
  async createChannel(
    @MessageBody() channelDto: ChannelDto,
    @ConnectedSocket() client: Socket,
    @Req() req: any,
  ): Promise<void> {
    try {
      const errors = await validate(channelDto);
      if (errors.length > 0) {
        throw new BadRequestException(errors);
      }
      if (
        await this.channelService.createChannel(
          channelDto,
          req.user.login,
          client,
        )
      ) {
        client.emit('error', 'This channel already exists');
      } else {
        this.server.emit('channel-created', channelDto.name);
      }
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('reconnect')
  async reconnect(
    @MessageBody() channelDto: ChannelDto,
    @ConnectedSocket() client: Socket,
    @Req() req: any,
  ): Promise<void> {
    try {
      const membership = await this.membershipService.findOne(
        channelDto.name,
        req.user.login,
      );
      if (!membership) {
        client.emit('error', 'You are not a member of this channel');
        return;
      }
      await this.channelService.checkConnection(
        channelDto.name,
        req.user?.login,
        client,
      );
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('remove-channel')
  async removeChannel(
    @MessageBody() channelDto: ChannelDto,
    @ConnectedSocket() client: Socket,
    @Req() req: any,
  ): Promise<void> {
    try {
      const membership = await this.membershipService.findOne(
        channelDto.name,
        req.user.login,
      );
      if (membership?.role !== 'owner') {
        client.emit('error', 'You are not the owner of this channel');
        return;
      }
      await this.channelService.removeChannel(
        channelDto.name,
        client,
        this.server,
      );
      this.server.emit('channel-removed', channelDto.name);
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('ban-user')
  async banUser(
    @MessageBody() membershipDto: MembershipDto,
    @ConnectedSocket() client: Socket,
    @Req() req: any,
  ): Promise<void> {
    try {
      if (
        !(await this.channelService.banUser(
          membershipDto,
          req.user.login,
          client,
        ))
      ) {
        this.server.to(membershipDto.channelName).emit('user-banned');
        client.emit('success', 'User banned');
      }
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('block-user')
  async blockUser(
    @MessageBody() membershipDto: MembershipDto,
    @ConnectedSocket() client: Socket,
    @Req() req: any,
  ): Promise<void> {
    try {
      if (
        !(await this.channelService.blockUser(
          membershipDto,
          req.user.login,
          client,
        ))
      ) {
        client.emit('success', 'User blocked');
      }
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('mute-user')
  async muteUser(
    @MessageBody() membershipDto: MembershipDto,
    @ConnectedSocket() client: Socket,
    @Req() req: any,
  ): Promise<void> {
    try {
      if (
        !(await this.channelService.muteUser(
          membershipDto,
          req.user.login,
          client,
        ))
      ) {
        client.emit('success', 'User muted');
      }
    } catch (error) {
      console.log(error);
    }
  }
}

import { async } from 'rxjs';
import { ChannelService } from './channel.service';
import { JwtAuthGuard } from '../auth/auth-jwt.guard';
import { MembershipService } from './membership.service';
import { Server, Socket } from 'socket.io';
import { UserService } from 'src/user/user.service';
import { validate } from 'class-validator';
import {
  ChannelDto,
  MembershipDto,
  MessageDto,
  PasswordDto,
} from './channel.pipe';
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
      if (messageDto.content === '') {
        client.emit('error', 'Message cannot be empty');
        return;
      } else if (messageDto.content.length > 1000) {
        client.emit('error', 'Message cannot be longer than 1000 characters');
        return;
      }
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
          .emit(
            'user-left',
            user.name,
            user.avatar,
            user.login,
            channelDto.name,
          );
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
      if (channelDto.isProtected && channelDto.password === '') {
        client.emit('error', 'Password cannot be empty');
        return;
      } else if (channelDto.name.length > 16 || channelDto.name.length < 3) {
        client.emit(
          'error',
          'Channel name must be between 3 and 16 characters',
        );
        return;
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
  @SubscribeMessage('create-dm')
  async createDm(
    @MessageBody() target: string,
    @ConnectedSocket() client: Socket,
    @Req() req: any,
  ): Promise<void> {
    try {
      if (await this.channelService.createDM(target, req.user.login, client)) {
        client.emit('dm-created', req.user.login + '-' + target);
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
        client.emit('reset');
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
      await this.channelService.removeChannel(channelDto.name, this.server);
      this.server.emit('channel-removed', channelDto.name);
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('kick-user')
  async kickUser(
    @MessageBody() membershipDto: MembershipDto,
    @ConnectedSocket() client: Socket,
    @Req() req: any,
  ): Promise<void> {
    try {
      if (
        await this.channelService.kickUser(
          membershipDto,
          req.user.login,
          client,
        )
      ) {
        this.server.to(membershipDto.channelName).emit('reload');
        client.emit('success', 'User kicked');
      }
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
        this.server.to(membershipDto.channelName).emit('reload');
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

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('set-admin')
  async setAdmin(
    @MessageBody() membershipDto: MembershipDto,
    @ConnectedSocket() client: Socket,
    @Req() req: any,
  ): Promise<void> {
    try {
      if (
        await this.channelService.setAdmin(
          membershipDto,
          req.user.login,
          client,
        )
      ) {
        client.emit('success', 'User is now an admin');
      }
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('add-password')
  async addPassword(
    @MessageBody() passwordDto: PasswordDto,
    @ConnectedSocket() client: Socket,
    @Req() req: any,
  ): Promise<void> {
    try {
      if (passwordDto.password === '') {
        client.emit('error', 'Password cannot be empty');
        return;
      }
      if (
        await this.channelService.addPassword(
          passwordDto.name,
          passwordDto.password,
          req.user.login,
          client,
        )
      ) {
        this.server.emit('reload');
        client.emit('success', 'Password added');
      }
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('remove-password')
  async removePassword(
    @MessageBody() passwordDto: PasswordDto,
    @ConnectedSocket() client: Socket,
    @Req() req: any,
  ): Promise<void> {
    try {
      if (
        await this.channelService.removePassword(
          passwordDto.name,
          req.user.login,
          client,
        )
      ) {
        this.server.emit('reload');
        client.emit('success', 'Password removed');
      }
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('edit-password')
  async editPassword(
    @MessageBody() passwordDto: PasswordDto,
    @ConnectedSocket() client: Socket,
    @Req() req: any,
  ): Promise<void> {
    try {
      if (passwordDto.password === '') {
        client.emit('error', 'Password cannot be empty');
        return;
      }
      if (
        await this.channelService.editPassword(
          passwordDto.name,
          passwordDto.password,
          req.user.login,
          client,
        )
      ) {
        this.server.emit('reload');
        client.emit('success', 'Password edited');
      }
    } catch (error) {
      console.log(error);
    }
  }
}

import { Channel } from './channel.entity';
import { ChannelDto, MembershipDto } from './channel.pipe';
import { DeepPartial, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MembershipService } from './membership.service';
import { MessageService } from './message.service';
import { Server } from 'socket.io';
import { Socket } from 'dgram';
import { User } from 'src/user/user.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelModel: Repository<Channel>,
    private readonly messageService: MessageService,
    private readonly userService: UserService,
    private readonly membershipService: MembershipService,
  ) {}

  create(channelData: Required<Channel>): Channel {
    const channel = this.channelModel.create(channelData);
    return channel;
  }

  async checkConnection(
    channelName: string,
    login: string,
    client: any,
  ): Promise<void> {
    const membership = await this.membershipService.findOne(channelName, login);

    if (membership && membership.isBanned == false) {
      client.join(channelName);
    } else if (membership && membership.isBanned == true) {
      client.emit('error-banned');
      return;
    }
  }

  async addMessage(
    content: string,
    channelName: string,
    login: string,
    client: any,
  ): Promise<boolean> {
    const user = await this.userService.findOne(login);
    if (!user) {
      return;
    }
    const channel = await this.findOne(channelName);
    const membership = await this.membershipService.findOne(
      channel.name,
      user.login,
    );
    if (!membership) {
      return true;
    } else if (membership.isMuted == true) {
      client.emit('error', 'You are muted from this channel');
      return false;
    } else if (membership.isBanned == true) {
      client.emit('error', 'You are banned from this channel');
      return false;
    }
    const message = this.messageService.create({
      content: content,
      createdAt: new Date(),
    });
    message.user = user;
    await this.messageService.save(message);
    if (!user.messages) {
      user.messages = [];
    }
    user.messages.push(message);
    message.channel = channel;
    await this.messageService.save(message);
    if (!channel.messages) {
      channel.messages = [];
    }
    channel.messages.push(message);
    await this.userService.save(user);
    await this.channelModel.save(channel);
    return true;
  }

  async addMembership(
    channelDto: ChannelDto,
    login: string,
    role: string,
    client: any,
  ): Promise<boolean> {
    const user = await this.userService.findOne(login);
    if (!user) {
      return true;
    }
    const channel = await this.findOne(channelDto.name);
    if (
      channel &&
      (await this.membershipService.findOne(channel.name, user.login))
    ) {
      return false;
    }
    if (channelDto.isProtected && channelDto.password !== channel.password) {
      client.emit('error', 'Wrong password');
      return true;
    }

    const membership = this.membershipService.create({
      role: role,
      isBanned: false,
      isMuted: false,
      user: user,
      channel: channel,
    });
    if (!user.memberships) {
      user.memberships = [];
    }
    if (!channel.memberships) {
      channel.memberships = [];
    }
    user.memberships.push(membership);
    channel.memberships.push(membership);
    await this.channelModel.save(channel);
    await this.userService.save(user);
    return false;
  }

  async removeMembership(
    channelName: string,
    login: string,
    client: any,
    server: any,
  ): Promise<boolean> {
    const user = await this.userService.findOne(login);
    if (!user) {
      return true;
    }
    let channel = await this.findOne(channelName);
    if (!channel) {
      return true;
    }
    const membership = await this.membershipService.findOne(
      channel.name,
      user.login,
    );
    if (!membership) {
      return true;
    }
    if (membership.isBanned == true) {
      client.emit('error', 'You are banned from this channel');
      return true;
    }
    if (membership.role === 'owner') {
      const users = (await this.userService.findAll()) as User[];
      await this.membershipService.remove(membership);
      for (let i = 0; i < users.length; i++) {
        const newMembership = await this.membershipService.findOne(
          channel.name,
          users[i].login,
        );
        if (newMembership && newMembership.isBanned == false) {
          newMembership.role = 'owner';
          await this.membershipService.save(newMembership);
          return false;
        }
      }
      await this.removeChannel(channel.name, client, server);
      client.emit('success', 'Channel removed');
    } else {
      await this.membershipService.remove(membership);
    }
    return false;
  }

  async getMessageHistory(channelName: string): Promise<any> {
    const channel = await this.findOne(channelName);
    return channel.messages;
  }

  async createChannel(
    channel: any,
    login: string,
    client: any,
  ): Promise<boolean> {
    if (await this.findOne(channel.name)) {
      return true;
    }
    const newChannel = this.create({
      name: channel.name,
      messages: [],
      memberships: [],
      isProtected: channel.isProtected,
      isPublic: channel.isPublic,
      password: channel.password,
    });
    await this.save(channel);
    await this.addMembership(channel.name, login, 'owner', client);
    return false;
  }

  async removeChannel(
    channelName: string,
    client: any,
    server: any,
  ): Promise<void> {
    const users = (await this.userService.findAll()) as User[];
    for (let i = 0; i < users.length; i++) {
      const membership = await this.membershipService.findOne(
        channelName,
        users[i].login,
      );
      if (membership) {
        await this.membershipService.remove(membership);
      }
    }
    const channel = await this.findOne(channelName);
    if (channel) {
      for (let i = 0; i < channel.messages.length; i++) {
        await this.messageService.remove(channel.messages[i]);
      }
      await this.channelModel.remove(channel);
      server.emit('channel-removed', channel.name);
    }
  }

  async banUser(
    membershipDto: any,
    login: string,
    client: any,
  ): Promise<boolean> {
    const userToBan = await this.membershipService.findOne(
      membershipDto.channelName,
      membershipDto.login,
    );
    const owner = await this.membershipService.findOne(
      membershipDto.channelName,
      login,
    );
    if (userToBan.role === 'owner') {
      client.emit('error', 'You cannot ban the owner of this channel');
      return true;
    }
    if (owner.role !== 'owner' && owner.role !== 'admin') {
      client.emit('error', 'You dont have the role to ban this user');
      return true;
    }
    userToBan.isBanned = true;
    await this.membershipService.save(userToBan);
    return false;
  }

  async blockUser(
    membershipDto: MembershipDto,
    login: string,
    client: any,
  ): Promise<boolean> {
    const owner = await this.userService.findOne(login);
    if (!owner) {
      return true;
    }
    if (!(await this.userService.findOne(membershipDto.login))) {
      client.emit('error', 'User not found');
      return true;
    }
    if (login === membershipDto.login) {
      client.emit('error', 'You cannot block yourself');
      return true;
    }
    owner.blocked.push(membershipDto.login);
    this.userService.save(owner);
    return false;
  }

  async muteUser(
    membershipDto: MembershipDto,
    login: string,
    client: any,
  ): Promise<boolean> {
    const userToMute = await this.membershipService.findOne(
      membershipDto.channelName,
      membershipDto.login,
    );
    const owner = await this.membershipService.findOne(
      membershipDto.channelName,
      login,
    );
    if (userToMute.role === 'owner') {
      console.log(userToMute);
      client.emit('error', 'You cannot mute the owner of this channel');
      return true;
    }
    if (owner.role !== 'owner' && owner.role !== 'admin') {
      client.emit('error', 'You dont have the role to mute this user');
      return true;
    }
    if (login === membershipDto.login) {
      client.emit('error', 'You cannot mute yourself');
      return true;
    }
    userToMute.isMuted = true;
    await this.membershipService.save(userToMute);
  }

  async save(channel: Channel): Promise<Channel> {
    return await this.channelModel.save(channel);
  }

  update(channel: Channel, channelData: DeepPartial<Channel>): Channel {
    const updatedChannel = this.channelModel.merge(channel, channelData);
    this.channelModel.save(updatedChannel);
    return updatedChannel;
  }

  findOne(name: string): Promise<Channel> {
    return this.channelModel.findOne({
      relations: ['messages', 'memberships', 'messages.user'],
      where: {
        name,
      },
    });
  }

  findAll(): Promise<Channel[]> {
    return this.channelModel.find();
  }
}

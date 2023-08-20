import { Channel } from './channel.entity';
import { ChannelDto } from './channel.pipe';
import { DeepPartial, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MembershipService } from './membership.service';
import { MessageService } from './message.service';
import { Server } from 'socket.io';
import { Socket } from 'dgram';
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
    if (await this.membershipService.findOne(channelName, login)) {
      client.join(channelName);
    }
  }

  async addMessage(
    content: string,
    channelName: string,
    login: string,
  ): Promise<void> {
    const channel = await this.findOne(channelName);
    const message = this.messageService.create({
      content: content,
      createdAt: new Date(),
    });
    const user = await this.userService.findOne(login);
    if (!user) {
      return;
    }
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
    let channel = await this.findOne(channelDto.name);
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

  async removeMembership(channelName: string, login: string): Promise<boolean> {
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
    await this.membershipService.remove(membership);
    return false;
  }

  async getMessageHistory(channelName: string): Promise<any> {
    const channel = await this.findOne(channelName);
    return channel.messages;
  }

  async createChannel(channel: any, login: string): Promise<boolean> {
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
    await this.addMembership(channel.name, login, 'owner', null);
    return false;
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

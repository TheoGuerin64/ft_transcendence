import { Channel } from './channel.entity';
import { DeepPartial, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MembershipService } from './membership.service';
import { MessageService } from './message.service';
import { Server } from 'socket.io';
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
    this.channelModel.save(channel);
    return channel;
  }

  async addMessage(data: any) {
    const channel = await this.findOne(data.channelName);
    const message = this.messageService.create({
      text: data.message,
      createdAt: new Date(),
    });
    const user = await this.userService.findOne(data.login);
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
    data: any,
    alreadyJoined: { value: boolean },
  ): Promise<void> {
    const user = await this.userService.findOne(data.login);
    if (!user) {
      return;
    }
    let channel = await this.findOne(data.channelName);
    if (
      channel &&
      (await this.membershipService.findOne(channel.name, user.login))
    ) {
      alreadyJoined.value = true;
      return;
    }
    if (!channel) {
      channel = this.create({
        name: data.channelName,
        messages: [],
        memberships: [],
        isProtected: false,
        isPublic: true,
        password: '',
      });
    }
    const membership = this.membershipService.create({
      role: 'user',
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
  }

  async removeMembership(data: any): Promise<void> {
    const user = await this.userService.findOne(data.login);
    if (!user) {
      return;
    }
    let channel = await this.findOne(data.channelName);
    if (!channel) {
      return;
    }
    const membership = await this.membershipService.findOne(
      channel.name,
      user.login,
    );
    await this.membershipService.remove(membership);
  }

  async getMessageHistory(channelName: string): Promise<any> {
    const channel = await this.findOne(channelName);
    return channel?.messages;
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
}

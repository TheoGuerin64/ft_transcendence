import * as bcrypt from 'bcrypt';
import { Channel } from './channel.entity';
import { ChannelDto, MembershipDto } from './channel.pipe';
import { DeepPartial, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MembershipService } from './membership.service';
import { MessageService } from './message.service';
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
      if (membership.expireDate.getTime() < new Date().getTime()) {
        membership.isMuted = false;
      } else {
        client.emit('error', 'You are muted from this channel');
        return false;
      }
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
    if (
      channelDto.isProtected &&
      role !== 'owner' &&
      !(await bcrypt.compare(channelDto.password, channel.password))
    ) {
      client.emit('error', 'Wrong password');
      return true;
    }

    const membership = await this.membershipService.create({
      role: role,
      isBanned: false,
      isMuted: false,
      user: user,
      channel: channel,
      expireDate: new Date(),
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
    const channel = await this.findOne(channelName);
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
      await this.removeChannel(channel.name, server);
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
    if (channel.password !== '') {
      channel.password = await bcrypt.hash(channel.password, 10);
    }
    const newChannel = this.create({
      name: channel.name,
      messages: [],
      memberships: [],
      isProtected: channel.isProtected,
      isPublic: channel.isPublic,
      isDM: false,
      password: channel.password,
    });
    await this.save(newChannel);
    await this.addMembership(
      {
        name: newChannel.name,
        isProtected: newChannel.isProtected,
        isPublic: newChannel.isPublic,
        password: newChannel.password,
      },
      login,
      'owner',
      client,
    );
    return false;
  }

  /**
   * Create a DM between two users
   * @param target Login of the user to create the DM with
   * @param request Login of the user who requested the DM
   * @param client Socket of the user who requested the DM
   * @returns false if the DM already exists, true otherwise
   */
  async createDM(
    target: string,
    request: string,
    client: any,
  ): Promise<boolean> {
    const channelName = request + '-' + target;
    const channelNameRev = target + '-' + request;
    if (await this.findOne(channelName)) {
      client.emit('error', 'This DM already exists');
      client.emit('redirect', '/chat/' + channelName);
      return false;
    } else if (await this.findOne(channelNameRev)) {
      client.emit('error', 'This DM already exists');
      client.emit('redirect', '/chat/' + channelNameRev);
      return false;
    }
    const requestUser = await this.userService.findOne(request);
    const targetUser = await this.userService.findOne(target);
    const newChannel = this.create({
      name: channelName,
      messages: [],
      memberships: [],
      isProtected: false,
      isPublic: false,
      isDM: true,
      password: '',
    });
    await this.save(newChannel);
    await this.membershipService.create({
      role: 'member',
      isBanned: false,
      isMuted: false,
      user: requestUser,
      channel: newChannel,
      expireDate: new Date(),
    });
    await this.membershipService.create({
      role: 'member',
      isBanned: false,
      isMuted: false,
      user: targetUser,
      channel: newChannel,
      expireDate: new Date(),
    });
    return true;
  }

  async removeChannel(channelName: string, server: any): Promise<void> {
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

  async kickUser(member: MembershipDto, login: string, client: any) {
    const userToKick = await this.membershipService.findOne(
      member.channelName,
      member.login,
    );
    if (!userToKick) {
      client.emit('error', 'User is not part of the channel');
      return false;
    }
    const owner = await this.membershipService.findOne(
      member.channelName,
      login,
    );
    if (userToKick.role === 'owner') {
      client.emit('error', 'You cannot kick the owner of this channel');
      return false;
    }
    if (owner.role !== 'owner' && owner.role !== 'admin') {
      client.emit('error', 'You dont have the role to kick this user');
      return false;
    }
    client.leave(member.channelName);
    await this.membershipService.remove(userToKick);
    return true;
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
    if (owner.blocked.includes(membershipDto.login)) {
      client.emit('error', 'User already blocked');
      return true;
    }
    owner.blocked.push(membershipDto.login);
    this.userService.save(owner);
    return false;
  }

  /**
   * Mute a user for a duration of 30 seconds (0.5 minutes)
   * @param membershipDto
   * @param login
   * @param client
   * @returns true if the user is muted, false otherwise
   */
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
    userToMute.expireDate = new Date(new Date().getTime() + 0.5 * 60000);
    await this.membershipService.save(userToMute);
    return false;
  }

  async setAdmin(membershipDto: MembershipDto, login: string, client: any) {
    const userToSet = await this.membershipService.findOne(
      membershipDto.channelName,
      membershipDto.login,
    );
    const owner = await this.membershipService.findOne(
      membershipDto.channelName,
      login,
    );
    if (userToSet.role === 'owner') {
      client.emit('error', 'You cannot set the owner of this channel as admin');
      return false;
    }
    if (owner.role !== 'owner' && owner.role !== 'admin') {
      client.emit('error', 'You dont have the role to set this user as admin');
      return false;
    }
    if (userToSet.role === 'admin') {
      client.emit('error', 'This user is already admin');
      return false;
    }
    userToSet.role = 'admin';
    await this.membershipService.save(userToSet);
    return true;
  }

  async addPassword(
    channelName: string,
    password: string,
    login: string,
    client: any,
  ): Promise<boolean> {
    const membership = await this.membershipService.findOne(channelName, login);
    if (!membership) {
      client.emit('error', 'You are not a member of this channel');
      return false;
    }
    if (membership.role !== 'owner') {
      client.emit('error', 'You are not the owner of this channel');
      return false;
    }
    const channel = await this.findOne(channelName);
    if (!channel) {
      return false;
    }
    if (!channel.isProtected && channel.isPublic) {
      channel.password = await bcrypt.hash(password, 10);
      channel.isProtected = true;
      channel.isPublic = false;
    } else if (!channel.isProtected && !channel.isPublic) {
      client.emit('error', 'This channel is already private');
      return false;
    } else if (channel.isProtected) {
      client.emit('error', 'This channel is already protected');
      return false;
    }
    await this.channelModel.save(channel);
    return true;
  }

  async removePassword(
    channelName: string,
    login: string,
    client: any,
  ): Promise<boolean> {
    const membership = await this.membershipService.findOne(channelName, login);
    if (!membership) {
      client.emit('error', 'You are not a member of this channel');
      return false;
    }
    if (membership.role !== 'owner') {
      client.emit('error', 'You are not the owner of this channel');
      return false;
    }
    const channel = await this.findOne(channelName);
    if (!channel) {
      return false;
    }
    if (channel.isProtected && !channel.isPublic) {
      channel.password = '';
      channel.isProtected = false;
      channel.isPublic = true;
    } else if (!channel.isProtected && !channel.isPublic) {
      client.emit('error', 'This channel is private');
      return false;
    } else if (channel.isProtected) {
      client.emit('error', 'This channel is protected');
      return false;
    }
    await this.channelModel.save(channel);
    return true;
  }

  async editPassword(
    channelName: string,
    password: string,
    login: string,
    client: any,
  ) {
    const membership = await this.membershipService.findOne(channelName, login);
    if (!membership) {
      client.emit('error', 'You are not a member of this channel');
      return false;
    }
    if (membership.role !== 'owner') {
      client.emit('error', 'You are not the owner of this channel');
      return false;
    }
    const channel = await this.findOne(channelName);
    if (!channel) {
      return false;
    }
    if (!channel.isProtected && channel.isPublic) {
      client.emit('error', 'This channel is public');
      return false;
    } else if (!channel.isProtected && !channel.isPublic) {
      client.emit('error', 'This channel is private');
      return false;
    } else if (channel.isProtected) {
      channel.password = await bcrypt.hash(password, 10);
    }
    await this.channelModel.save(channel);
    return true;
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

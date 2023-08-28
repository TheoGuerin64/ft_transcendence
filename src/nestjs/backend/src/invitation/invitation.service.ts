import { DeepPartial, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Invitation } from './invitation.entity';
import { ChannelService } from 'src/chat/channel.service';
import { PongGateway } from 'src/pong/game/pong.gateway';

@Injectable()
export class InvitationService {
  constructor(
    @InjectRepository(Invitation)
    private readonly invitationModel: Repository<Invitation>,
    private readonly channelService: ChannelService,
    private readonly pongGateway: PongGateway,
  ) {}

  async sendInvitation(invitationData: DeepPartial<Invitation>): Promise<void> {
    const invitation = await this.invitationModel.create(invitationData);
    await this.invitationModel.save(invitation);
  }

  findOne(condition: any): Promise<Invitation | null> {
    return this.invitationModel.findOne({
      relations: ['requester', 'requested', 'channel'],
      where: condition,
    });
  }

  async findInvitation(
    requester_login: string,
    requested_login: string,
    channel_id: string,
  ): Promise<Invitation> {
    return this.invitationModel.findOne({
      relations: ['requester', 'requested', 'channel'],
      where: [{ requester_login, requested_login, channel_id }],
    });
  }

  async findInvitationById(id: number): Promise<Invitation> {
    return await this.invitationModel.findOne({
      relations: ['requester', 'requested', 'channel'],
      where: [{ id }],
    });
  }

  async getInvitations(login: string): Promise<Invitation[]> {
    return await this.invitationModel.find({
      where: [{ requested_login: login }],
      relations: ['requester', 'requested', 'channel'],
    });
  }

  async acceptInvitation(
    invitation: Invitation,
    socket_id: string,
  ): Promise<void> {
    if (invitation.channel !== null) {
      await this.channelService.addMembership(
        {
          name: invitation.channel_id,
          isProtected: false,
          isPublic: false,
          password: '',
        },
        invitation.requested_login,
        'member',
        invitation.requester_socket_id,
      );
    } else {
      this.pongGateway.invitationGame(
        {
          login: invitation.requester_login,
          username: invitation.requester_login,
          socketID: invitation.requester_socket_id,
        },
        {
          login: invitation.requested_login,
          username: invitation.requested_login,
          socketID: socket_id,
        },
        'normal',
      );
    }

    await this.invitationModel.delete(invitation.id);
  }

  async refuseInvitation(invitation: Invitation): Promise<void> {
    await this.invitationModel.delete(invitation.id);
  }
}

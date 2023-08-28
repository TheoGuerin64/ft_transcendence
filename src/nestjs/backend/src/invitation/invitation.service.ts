import { DeepPartial, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Invitation } from './invitation.entity';

@Injectable()
export class InvitationService {
  constructor(
    @InjectRepository(Invitation)
    private readonly invitationModel: Repository<Invitation>,
  ) {}

  async sendInvitation(invitationData: DeepPartial<Invitation>): Promise<void> {
    const invitation = await this.invitationModel.create(invitationData);
    await this.invitationModel.save(invitation);
  }

  async findInvitationById(id: number): Promise<Invitation> {
    return await this.invitationModel.findOne({
      relations: ['requester', 'requested', 'channel'],
      where: [{ id }],
    });
  }

  async getInvitations(login: string): Promise<Invitation[]> {
    return await this.invitationModel.find({
      where: [{ requester_login: login }],
      relations: ['requester', 'requested', 'channel'],
    });
  }

  async acceptInvitation(
    invitation: Invitation,
    socket_id: string,
  ): Promise<void> {
    if (invitation.channel !== null) {
      console.log('join channel');
      // TODO: join channel
    } else {
      console.log('join match');
      // TODO: join match
    }

    await this.invitationModel.delete(invitation.id);
  }

  async refuseInvitation(invitation: Invitation): Promise<void> {
    await this.invitationModel.delete(invitation.id);
  }
}

import { async } from 'rxjs';
import { DeepPartial, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Membership } from './membership.entity';

@Injectable()
export class MembershipService {
  constructor(
    @InjectRepository(Membership)
    private readonly membershipModel: Repository<Membership>,
  ) {}

  create(membershipData: DeepPartial<Membership>): Membership {
    const membership = this.membershipModel.create(membershipData);
    this.membershipModel.save(membership);
    return membership;
  }

  update(
    membership: Membership,
    membershipData: DeepPartial<Membership>,
  ): Membership {
    const updatedMembership = this.membershipModel.merge(
      membership,
      membershipData,
    );
    this.membershipModel.save(updatedMembership);
    return updatedMembership;
  }

  async save(membership: Membership): Promise<Membership> {
    return await this.membershipModel.save(membership);
  }

  async remove(membership: Membership): Promise<Membership> {
    return await this.membershipModel.remove(membership);
  }

  findOne(channelName: string, login: string): Promise<Membership> {
    return this.membershipModel.findOne({
      relations: ['channel', 'user'],
      where: { channel: { name: channelName }, user: { login } },
    });
  }
}

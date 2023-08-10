import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Friendship } from './friendship.entity';

@Injectable()
export class FriendshipService {
  constructor(
    @InjectRepository(Friendship)
    private readonly friendsModel: Repository<Friendship>,
  ) {}

  findFriends(login: string): Promise<Friendship[]> {
    return this.friendsModel.find({
      relations: ['requester', 'requested'],
      where: [{ requester: { login } }, { requested: { login } }],
    });
  }

  async addFriendship(data: DeepPartial<Friendship>): Promise<void> {
    const friendship = this.friendsModel.create(data);
    await this.friendsModel.save(friendship);
  }
}

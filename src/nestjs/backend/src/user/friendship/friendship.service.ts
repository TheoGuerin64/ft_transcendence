import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friendship } from './friendship.entity';

@Injectable()
export class FriendshipService {
  constructor(
    @InjectRepository(Friendship)
    private readonly friendsModel: Repository<Friendship>,
  ) {}

  /**
   * Find friendship between two users
   * @param login1 login of the first user
   * @param login2 login of the second user
   * @param relation if true, return the friendship with the users
   * @returns friendship between the two users
   */
  findFriendship(
    login1: string,
    login2: string,
    relations = false,
  ): Promise<Friendship | null> {
    return this.friendsModel.findOne({
      relations: relations ? ['requester', 'requested'] : [],
      where: [
        { requester_login: login1, requested_login: login2 },
        { requester_login: login2, requested_login: login1 },
      ],
    });
  }

  /**
   * Find all friends of a user
   * @param login login of the user
   * @returns friends of the user
   */
  async findFriends(login: string): Promise<any[]> {
    const friendships = await this.friendsModel.find({
      relations: ['requester', 'requested'],
      where: [{ requester: { login } }, { requested: { login } }],
    });
    return friendships.map((friendship) =>
      friendship.requester.login == login
        ? {
            ...friendship.requested.public,
            accepted: friendship.accepted,
            sender: true,
          }
        : {
            ...friendship.requester.public,
            accepted: friendship.accepted,
            sender: false,
          },
    );
  }

  /**
   * Add a friendship request
   * @param login login of the user
   * @param friendLogin login of the friend
   */
  async addFriendshipRequest(
    login: string,
    friendLogin: string,
  ): Promise<void> {
    const existingFriendship = await this.findFriendship(login, friendLogin);
    if (existingFriendship) {
      if (existingFriendship.accepted) {
        throw new Error('Friendship already exists');
      }
      throw new Error('Friendship request already exists');
    }

    const friendship = this.friendsModel.create({
      requester_login: login,
      requested_login: friendLogin,
    });
    await this.friendsModel.save(friendship);
  }

  /**
   * Accept a friendship request
   * @param login login of the user
   * @param friendLogin login of the friend
   */
  async acceptFriendshipRequest(
    login: string,
    friendLogin: string,
  ): Promise<void> {
    const friendship = await this.findFriendship(login, friendLogin);
    if (!friendship) {
      throw new Error('Friendship request does not exist');
    }
    if (friendship.accepted) {
      throw new Error('Friendship already accepted');
    }
    if (friendship.requested_login != login) {
      throw new Error('Friendship already requested');
    }

    await this.friendsModel.update(
      {
        requester_login: friendship.requester_login,
        requested_login: friendship.requested_login,
      },
      { accepted: true },
    );
  }

  /**
   * Is a user friend with another user
   * @param login login of the user
   * @param friendLogin login of the friend
   * @returns true if the user is friend with the other user
   */
  isFriends(login1: string, login2: string): Promise<boolean> {
    return this.friendsModel.exist({
      where: [
        { requester_login: login1, requested_login: login2 },
        { requester_login: login2, requested_login: login1 },
      ],
    });
  }

  /**
   * Delete a friendship
   * @param login login of the user
   * @param friendLogin login of the friend
   */
  async deleteFriendship(login: string, friendLogin: string): Promise<void> {
    const friendship = await this.findFriendship(login, friendLogin);
    if (!friendship) {
      throw new Error('Friendship does not exist');
    }

    await this.friendsModel.remove(friendship);
  }
}

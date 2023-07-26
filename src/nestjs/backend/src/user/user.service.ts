import { DeepPartial, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';

export interface PublicData {
  name: string;
  avatar: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userModel: Repository<User>,
  ) {}

  create(userData: Required<User>): User {
    const user = this.userModel.create(userData);
    this.userModel.save(user);
    return user;
  }

  update(user: User, userData: DeepPartial<User>): User {
    const updatedUser = this.userModel.merge(user, userData);
    this.userModel.save(updatedUser);
    return updatedUser;
  }

  findOne(login: string): Promise<User> {
    return this.userModel.findOne({
      where: {
        login,
      },
    });
  }

  getPublicData(user: User): PublicData {
    return { name: user.name, avatar: user.avatar };
  }
}

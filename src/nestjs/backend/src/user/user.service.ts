import { DeepPartial, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserStatsService } from 'src/userStats/userStats.service';

export interface PublicData {
  name: string;
  avatar: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userModel: Repository<User>,
    private readonly userStatsService: UserStatsService,
  ) {}

  async create(userData: DeepPartial<User>): Promise<User> {
    const user = await this.userModel.create(userData);
    user.stats = await this.userStatsService.init();
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
      where: { login },
      relations: ['matchPlayed'],
    });
  }

  find(login: string): Promise<User[]> {
    return this.userModel.find({
      where: { login },
      relations: ['matchPlayed'],
    });
  }

  getPublicData(user: User): PublicData {
    return { name: user.name, avatar: user.avatar };
  }
}

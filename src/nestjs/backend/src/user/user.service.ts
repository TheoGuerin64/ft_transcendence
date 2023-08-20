import { DeepPartial, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserStatsService } from 'src/userStats/userStats.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userModel: Repository<User>,
    private readonly userStatsService: UserStatsService,
  ) {}

  /**
   * Create a new user and save it in the database
   * @param userData User data
   * @returns Created user
   */
  async create(userData: DeepPartial<User>): Promise<User> {
    const user = this.userModel.create(userData);
    user.stats = await this.userStatsService.init();
    await this.userModel.save(user);
    return user;
  }

  /**
   * Update a user and save it in the database
   * @param user User to update
   * @param userData User data
   * @returns Updated user
   */
  async update(user: User, userData: DeepPartial<User>): Promise<User> {
    Object.assign(user, userData);
    //await this.userModel.update(user.login, user);
    await this.userModel.save(user);
    return user;
  }

  /**
   * Find a user by its login
   * @param login Login of the user
   * @returns User
   */
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

  /**
   * Find all users
   * @returns List of users
   */
  findAll(): Promise<User[]> {
    return this.userModel.find();
  }
}

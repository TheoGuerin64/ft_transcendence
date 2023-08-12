import { DeepPartial, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userModel: Repository<User>,
  ) {}

  /**
   * Create a new user and save it in the database
   * @param userData User data
   * @returns Created user
   */
  create(userData: DeepPartial<User>): User {
    const user = this.userModel.create(userData);
    this.userModel.save(user);
    return user;
  }

  /**
   * Save a user in the database
   * @param user User to save
   * @returns Saved user
   */
  save(user: User): Promise<User> {
    return this.userModel.save(user);
  }

  /**
   * Update a user and save it in the database
   * @param user User to update
   * @param userData User data
   * @returns Updated user
   */
  update(user: User, userData: DeepPartial<User>): User {
    const updatedUser = this.userModel.merge(user, userData);
    this.userModel.save(updatedUser);
    return updatedUser;
  }

  /**
   * Find a user by its login
   * @param login Login of the user
   * @returns User
   */
  findOne(login: string): Promise<User> {
    return this.userModel.findOne({
      where: {
        login,
      },
    });
  }
}

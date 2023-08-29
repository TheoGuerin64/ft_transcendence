import { DeepPartial, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserStatsService } from 'src/userStats/userStats.service';
import { promisify } from 'util';
import { createDecipheriv, scrypt } from 'crypto';

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
  async update(user: User, userData: DeepPartial<User>): Promise<User> {
    Object.assign(user, userData);
    await this.userModel.save(user);
    return user;
  }

  /**
   * Find a user by its login
   * @param login Login of the user
   * @returns User
   */
  findOne(login: string): Promise<User | null> {
    return this.userModel.findOne({
      relations: ['messages', 'memberships', 'matchPlayed'],
      where: {
        login,
      },
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

  /**
   * Decrypt data
   * @param data Encrypted base64 data
   * @returns Decrypted data
   */
  async decrypt(data: string): Promise<string> {
    const key = (await promisify(scrypt)(
      process.env.TWOFA_PASSWORD,
      process.env.TWOFA_SALT,
      32,
    )) as Buffer;
    const decipher = createDecipheriv('aes-256-ctr', key, '0000000000000000');
    const buffer = Buffer.concat([
      decipher.update(data, 'base64'),
      decipher.final(),
    ]);
    return buffer.toString('utf-8');
  }
}

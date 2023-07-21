import { Injectable, UploadedFile } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userModel: Repository<User>,
  ) {}

  create(userData: Required<User>): User {
    return this.userModel.create(userData);
  }

  save(user: User): Promise<User> {
    return this.userModel.save(user);
  }

  update(user: User, userData: DeepPartial<User>): User {
    return this.userModel.merge(user, userData);
  }

  findOne(login: string): Promise<User> {
    return this.userModel.findOne({
      where: {
        login,
      },
    });
  }
}

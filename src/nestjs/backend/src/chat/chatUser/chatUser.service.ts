import { ChatUser } from './chatUser.entity';
import { DeepPartial, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ChatUserService {
  constructor(
    @InjectRepository(ChatUser)
    private readonly chatUserModel: Repository<ChatUser>,
  ) {}
}

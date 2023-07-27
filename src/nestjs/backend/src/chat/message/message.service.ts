import { DeepPartial, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './message.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageModel: Repository<Message>,
  ) {}

  findOne(id: number): Promise<Message> {
    return this.messageModel.findOne({
      where: {
        id,
      },
    });
  }
}

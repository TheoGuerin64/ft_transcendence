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

  create(messageData: DeepPartial<Message>): Message {
    const message = this.messageModel.create(messageData);
    this.messageModel.save(message);
    return message;
  }
}

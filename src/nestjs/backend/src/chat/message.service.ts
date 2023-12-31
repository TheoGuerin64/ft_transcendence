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
    return message;
  }

  async save(message: Message): Promise<Message> {
    return await this.messageModel.save(message);
  }

  update(message: Message, messageData: DeepPartial<Message>): Message {
    const updatedMessage = this.messageModel.merge(message, messageData);
    this.messageModel.save(updatedMessage);
    return updatedMessage;
  }

  async remove(message: Message): Promise<Message> {
    return await this.messageModel.remove(message);
  }
}

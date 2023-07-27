import { Chat } from '../chat.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Message } from '../message/message.entity';

@Entity()
export class ChatUser {
  @PrimaryGeneratedColumn()
  login: string;

  @Column()
  owner: boolean;

  @Column()
  admin: boolean;

  @Column()
  banned: boolean;

  @Column()
  muted: boolean;

  @ManyToOne(() => Chat, (chat) => chat.chatUsers)
  chat: Chat;

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];
}

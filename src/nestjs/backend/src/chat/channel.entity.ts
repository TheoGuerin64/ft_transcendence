import { Message } from './message/message.entity'
import { User } from '../user/user.entity'
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Channel {
  @PrimaryColumn()
  name: string;

  @OneToMany(() => Message, (messages) => messages.channel)
  messages: Message[];

  @ManyToMany(() => User, (user) => user.channels)
  @JoinTable()
  users: User[];
}

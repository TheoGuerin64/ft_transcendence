import { Channel } from './channel.entity';
import { User } from '../user/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @Column()
  createdAt: Date;

  @ManyToOne(() => Channel, (channel) => channel.messages)
  @JoinColumn()
  channel: Channel;

  @ManyToOne(() => User, (user) => user.messages)
  @JoinColumn()
  user: User;
}

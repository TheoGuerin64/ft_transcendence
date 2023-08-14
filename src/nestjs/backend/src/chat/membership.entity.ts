import { Channel } from './channel.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Membership {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  role: string;

  @Column()
  isBanned: boolean;

  @Column()
  isMuted: boolean;

  @ManyToOne(() => User, (user) => user.memberships)
  @JoinColumn({ name: 'login' })
  user: User;

  @ManyToOne(() => Channel, (channel) => channel.memberships)
  @JoinColumn({ name: 'channelName' })
  channel: Channel;
}

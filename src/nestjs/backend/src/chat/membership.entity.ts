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
  @JoinColumn()
  user: User;

  @ManyToOne(() => Channel, (channel) => channel.memberships)
  @JoinColumn()
  channel: Channel;
}

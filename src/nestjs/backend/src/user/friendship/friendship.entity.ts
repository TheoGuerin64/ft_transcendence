import { User } from '../user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique('login', ['requester_login', 'requested_login'])
@Unique('userc', ['requester', 'requested'])
export class Friendship {
  @PrimaryColumn({ type: 'char', length: 8, unique: true })
  requester_login: string;

  @PrimaryColumn({ type: 'char', length: 8, unique: true })
  requested_login: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'requester_login' })
  requester: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'requested_login' })
  requested: User;

  @Column({ type: 'boolean', default: false })
  accepted: boolean;
}

import { Channel } from 'src/chat/channel.entity';
import { User } from 'src/user/user.entity';
import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

@Entity()
@Check('requester_login != requested_login')
export class Invitation {
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

  @Column({ type: 'int' })
  requester_socket_id: number;

  @Column({ type: 'int' })
  requested_socket_id: number;

  @ManyToOne(() => Channel)
  id: string;
}

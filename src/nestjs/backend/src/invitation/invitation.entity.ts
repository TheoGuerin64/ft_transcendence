import { Channel } from 'src/chat/channel.entity';
import { User } from 'src/user/user.entity';
import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@Check('requester_login != requested_login')
export class Invitation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'char', length: 8 })
  requester_login: string;

  @Column({ type: 'char', length: 8 })
  requested_login: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'requester_login' })
  requester: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'requested_login' })
  requested: User;

  @Column({ type: 'char', length: 20 })
  requester_socket_id: string;

  @Column({ type: 'varchar', length: 16, nullable: true })
  channel_id: string;

  @ManyToOne(() => Channel, { nullable: true })
  @JoinColumn({ name: 'channel_id' })
  channel: string;
}

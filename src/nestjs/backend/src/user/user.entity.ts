import { Channel } from '../chat/channel.entity'
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryColumn({ type: 'char', length: 8 })
  login: string;

  @Column({ type: 'varchar', length: 16 })
  name: string;

  @Column({ type: 'char', length: 64 })
  access_token: string;

  @Column({ type: 'char', length: 64 })
  refresh_token: string;

  @Column({ type: 'varchar', length: 100 })
  avatar: string;

  @ManyToMany(() => Channel, (channel) => channel.users)
  @JoinTable()
  channels: Channel[];
}

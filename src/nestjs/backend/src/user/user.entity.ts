import { Channel } from '../chat/channel.entity';
import { Exclude, Expose } from 'class-transformer';
import { Membership } from '../chat/membership.entity';
import { Message } from 'src/chat/message.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryColumn({ type: 'char', length: 8 })
  login: string;

  @Column({ type: 'varchar', length: 16 })
  name: string;

  @Column({ type: 'varchar', length: 3000000 })
  avatar: string;

  @OneToMany(() => Membership, (membership) => membership.user)
  memberships: Membership[];

  @OneToMany(() => Message, (message) => message.user, { cascade: true })
  messages: Message[];

  @Column({ type: 'char', length: 52, nullable: true, default: null })
  @Exclude()
  twofaSecret: string;

  @Expose()
  get is2faEnabled(): boolean {
    return this.twofaSecret !== null;
  }
}

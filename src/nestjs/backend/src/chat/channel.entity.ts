import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Membership } from './membership.entity';
import { Message } from './message.entity';

@Entity()
export class Channel {
  @PrimaryColumn()
  name: string;

  @Column()
  isPublic: boolean;

  @Column()
  isProtected: boolean;

  @Column()
  password: string;

  @OneToMany(() => Message, (message) => message.channel, { cascade: true })
  messages: Message[];

  @OneToMany(() => Membership, (membership) => membership.channel, {
    cascade: true,
  })
  memberships: Membership[];
}

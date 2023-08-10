import { Channel } from '../chat/channel.entity';
import { Column, Entity, JoinTable, ManyToMany, PrimaryColumn } from 'typeorm';
import { Exclude, Expose } from 'class-transformer';

@Entity()
export class User {
  @PrimaryColumn({ type: 'char', length: 8 })
  login: string;

  @Column({ type: 'varchar', length: 16 })
  name: string;

  @Column({ type: 'varchar', length: 3000000 })
  avatar: string;

  @ManyToMany(() => Channel, (channel) => channel.users)
  @JoinTable()
  channels: Channel[];

  @Column({ type: 'char', length: 52, nullable: true, default: null })
  @Exclude()
  twofaSecret: string;

  @Expose()
  get is2faEnabled(): boolean {
    return this.twofaSecret !== null;
  }
}

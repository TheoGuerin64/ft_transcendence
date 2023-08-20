import { Exclude, Expose } from 'class-transformer';
import { MatchPlayed } from 'src/pong/database/matchPlayed.entity';
import { UserStats } from '../userStats/userStats.entity';
import {
  Column,
  DeepPartial,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';

export enum UserStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  PLAYING = 'playing',
}

@Entity()
export class User {
  @PrimaryColumn()
  login: string;

  @OneToOne(() => UserStats, (userStats) => userStats.user)
  @JoinColumn()
  stats: UserStats;

  @Column({ type: 'varchar', length: 16 })
  name: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.OFFLINE })
  status: UserStatus;

  @Column({ type: 'varchar', length: 3000000 })
  avatar: string;

  @ManyToMany(() => MatchPlayed, (matchPlayed) => matchPlayed.users, {
    cascade: true,
  })
  @JoinTable()
  matchPlayed: MatchPlayed[];

  @Column({ type: 'char', length: 52, nullable: true, default: null })
  @Exclude()
  twofaSecret: string;

  @Expose()
  get is2faEnabled(): boolean {
    return this.twofaSecret !== null;
  }

  @Exclude()
  @Expose()
  get public(): DeepPartial<User> {
    return {
      login: this.login,
      name: this.name,
      status: this.status,
      avatar: this.avatar,
    };
  }
}

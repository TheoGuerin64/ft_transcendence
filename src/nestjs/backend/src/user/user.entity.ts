import { MatchPlayed } from 'src/pong/database/matchPlayed.entity';
import { UserStats } from '../userStats/userStats.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryColumn()
  login: string;

  @OneToOne(() => UserStats, (userStats) => userStats.user)
  @JoinColumn()
  stats: UserStats;

  @Column({ type: 'varchar', length: 16 })
  name: string;

  @Column({ type: 'char', length: 64 })
  access_token: string;

  @Column({ type: 'char', length: 64 })
  refresh_token: string;

  @Column({ type: 'varchar', length: 100 })
  avatar: string;

  @ManyToMany(() => MatchPlayed, (matchPlayed) => matchPlayed.users, {
    cascade: true,
  })
  @JoinTable()
  matchPlayed: MatchPlayed[];
}

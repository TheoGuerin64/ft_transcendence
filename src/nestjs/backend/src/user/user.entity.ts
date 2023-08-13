import { Column, Entity, JoinTable, OneToMany, PrimaryColumn } from 'typeorm';
import { GameHistory } from 'src/pong/database/gameHistory.entity';

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

  @OneToMany(() => GameHistory, (GameHistory) => GameHistory.users)
  @JoinTable()
  gameHistory: GameHistory[];
}

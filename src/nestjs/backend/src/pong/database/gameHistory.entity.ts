import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { User } from '../../user/user.entity';

@Entity()
export class GameHistory {
  @PrimaryColumn({ type: 'int' })
  id: number;

  @OneToMany(() => GameHistory, (GameHistory) => GameHistory.users)
  users: User[];

  @Column('int', { array: true })
  result: number[];
}

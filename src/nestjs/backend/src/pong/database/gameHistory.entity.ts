import { Column, Entity, JoinTable, OneToMany, PrimaryColumn } from 'typeorm';
import { User } from '../../user/user.entity';

@Entity()
export class GameHistory {
  @PrimaryColumn({ type: 'int' })
  id: number;

  @Column({ type: 'char', length: 10 })
  @OneToMany(() => User, (user) => user.gameHistory)
  @JoinTable()
  users: User[];

  @Column({ type: 'int' })
  result: number[];
}

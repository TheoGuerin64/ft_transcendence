import {
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/user.entity';

@Entity()
export class GameHistory {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @OneToMany(() => GameHistory, (GameHistory) => GameHistory.users)
  users: User[];

  @Column('int', { array: true })
  result: number[];
}

import { User } from '../user/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class UserStats {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.stats)
  user: User;

  @Column()
  nbWin: number;

  @Column()
  nbLose: number;

  @Column()
  winRate: number;

  @Column()
  elo: number;

  @Column()
  ladder: number;
}

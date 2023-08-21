import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/user.entity';

@Entity()
export class MatchPlayed {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @ManyToMany(() => User, (user) => user.matchPlayed)
  users: User[];

  @Column('int', { array: true })
  result: number[];
}

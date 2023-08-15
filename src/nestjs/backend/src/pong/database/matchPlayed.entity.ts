import { User } from '../../user/user.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class MatchPlayed {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @ManyToMany(() => User, (user) => user.matchPlayed)
  users: User[];

  @Column('int', { array: true })
  result: number[];
}

import { User } from '../../user/user.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class MatchPlayed {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @OneToMany(() => MatchPlayed, (MatchPlayed) => MatchPlayed.users)
  users: User[];

  @Column('int', { array: true })
  result: number[];
}

import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryColumn({ type: 'char', length: 8 })
  login: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'char', length: 64 })
  token: string;

  @Column({ type: 'bigint' })
  expire_at: number;

  @Column({ type: 'char', length: 64 })
  refresh_token: string;

  @Column({ type: 'text' })
  avatar: string;
}

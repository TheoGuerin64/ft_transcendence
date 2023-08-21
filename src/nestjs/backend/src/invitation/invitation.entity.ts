import { Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Invitation {
  @PrimaryColumn({ type: 'char', length: 8 })
  login: string;
}

import { Exclude, Expose } from 'class-transformer';
import { Column, DeepPartial, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryColumn({ type: 'char', length: 8 })
  login: string;

  @Column({ type: 'varchar', length: 16 })
  name: string;

  @Column({ type: 'varchar', length: 3000000 })
  avatar: string;

  @Column({ type: 'char', length: 52, nullable: true, default: null })
  @Exclude()
  twofaSecret: string;

  @Expose()
  get is2faEnabled(): boolean {
    return this.twofaSecret !== null;
  }

  @Exclude()
  @Expose()
  get public(): DeepPartial<User> {
    return { login: this.login, name: this.name, avatar: this.avatar };
  }
}

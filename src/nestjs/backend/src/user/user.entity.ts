import { Exclude, Expose } from 'class-transformer';
import { Column, DeepPartial, Entity, PrimaryColumn } from 'typeorm';

export enum UserStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  PLAYING = 'playing',
}

@Entity()
export class User {
  @PrimaryColumn({ type: 'char', length: 8 })
  login: string;

  @Column({ type: 'varchar', length: 16 })
  name: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.OFFLINE })
  status: UserStatus;

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
    return {
      login: this.login,
      name: this.name,
      status: this.status,
      avatar: this.avatar,
    };
  }
}

import { Channel } from '../channel.entity'
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn
  } from 'typeorm'

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column()
  sender: string;

  @Column()
  createdAt: Date;

  @ManyToOne(() => Channel, (channel) => channel.messages)
  channel: Channel;
}

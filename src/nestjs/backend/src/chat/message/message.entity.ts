import { Chat } from '../chat.entity';
import { ChatUser } from '../chatUser/chatUser.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column()
  createdAt: Date;

  @ManyToOne(() => ChatUser, (chatUser) => chatUser.messages)
  sender: ChatUser;
}

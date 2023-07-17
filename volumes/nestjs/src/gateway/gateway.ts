import { OnModuleInit } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class myGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  sides = {
    left: null as string | null,
    right: null as string | null,
  };
  ready = {
    left: false,
    right: false,
  };

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log('connection', socket.id);
      if (this.sides.left && this.sides.right) {
        return;
      }
      const side = this.sides.left ? 'right' : 'left';
      socket.emit('side', side);
      this.sides[side] = socket.id;
    });
    this.server.on('disconnect', (socket) => {
      console.log('disconnect', socket.id);
      if (this.sides.left == socket.id) {
        this.sides.left = null;
      } else if (this.sides.right == socket.id) {
        this.sides.right = null;
      }
    });
  }

  @SubscribeMessage('cmove')
  handleMessage(@MessageBody() y: number, @ConnectedSocket() client: Socket) {
    if (client.id == this.sides.left) {
      this.server.sockets.sockets.get(this.sides.right).emit('smove', y);
    } else if (client.id == this.sides.right) {
      this.server.sockets.sockets.get(this.sides.left).emit('smove', y);
    }
  }

  @SubscribeMessage('ready')
  handleReady(@ConnectedSocket() client: Socket) {
    if (client.id == this.sides.left) {
      this.ready.left = true;
    } else if (client.id == this.sides.right) {
      this.ready.right = true;
    }
    if (this.ready.left && this.ready.right) {
      const random = Math.random();
      this.server.sockets.sockets.get(this.sides.left).emit('start', random);
      this.server.sockets.sockets.get(this.sides.right).emit('start', random);
    }
  }
}

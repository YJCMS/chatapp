import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { OnModuleInit } from '@nestjs/common';

// WebSocketGateway 데코레이터를 사용하여 게이트웨이를 생성
@WebSocketGateway()
export class MyGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  // onModuleInit() 메소드를 사용하여 서버에 연결된 소켓을 확인
  onModuleInit(): any {
    this.server.on('connection', (socket) => {
      console.log('New connection', socket.id);
      console.log('Connected');
    });
  }

  // newMessage로 이벤트 pub / onNewMessage로 이벤트 sub
  @SubscribeMessage('newMessage')
  onNewMessage(@MessageBody() body: any): any {
    console.log(body);
    // 리스닝하는 이벤트 이름 onMessage
    this.server.emit('onMessage', {
      msg: 'New Message',
      content: body,
    });
  }
}

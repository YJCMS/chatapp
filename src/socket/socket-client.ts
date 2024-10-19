import { Injectable } from '@nestjs/common';
import { io, Socket } from 'socket.io-client'; // socket.io-client에서 io와 Socket을 가져옴
// pnpm install socket.io-client

@Injectable() // NestJS의 Injectable 데코레이터를 사용하여 의존성 주입 가능
export class SocketClient {
  public socketClient: Socket; // Socket 타입의 socketClient 변수 선언

  constructor() {
    // io 함수를 사용하여 소켓 클라이언트를 생성하고 localhost:3000에 연결
    this.socketClient = io('http://localhost:3000');
  }

  onModuleInit() {
    this.registerConsumerEvents();
  }

  private registerConsumerEvents() {
    this.socketClient.emit('newMessage', { msg: 'Hello from Socket Client' });
    // 소켓이 연결되었을 때 'connect' 이벤트를 수신하고 콘솔에 메시지를 출력
    this.socketClient.on('connect', () => {
      console.log('Connected to Gateway');
    });

    this.socketClient.on('onMessage', (payload) => {
      console.log('Received message from Gateway');
      console.log(payload);
    });
  }
}

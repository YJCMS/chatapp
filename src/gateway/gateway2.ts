import {
  WebSocketGateway, // WebSocket 게이트웨이를 생성하는 데코레이터
  WebSocketServer, // WebSocket 서버를 주입하는 데코레이터
  SubscribeMessage, // 특정 메시지를 구독하는 데코레이터
  MessageBody, // 메시지 본문을 주입하는 데코레이터
  ConnectedSocket, // 연결된 소켓을 주입하는 데코레이터
  OnGatewayConnection, // 소켓 연결 이벤트를 처리하는 인터페이스
  OnGatewayDisconnect, // 소켓 연결 해제 이벤트를 처리하는 인터페이스
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'; // socket.io에서 Server와 Socket을 가져옴
import { Injectable } from '@nestjs/common'; // NestJS의 Injectable 데코레이터를 사용하여 의존성 주입 가능
import * as crypto from 'crypto'; // Node.js의 crypto 모듈을 사용하여 해시 생성

@Injectable() // NestJS의 Injectable 데코레이터를 사용하여 의존성 주입 가능
@WebSocketGateway() // WebSocket 게이트웨이를 생성
export class MyGatewayV2 implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server; // WebSocket 서버 인스턴스

  // 고유한 방 ID를 생성하는 메서드
  private generateUniqueRoomId(roomName: string): string {
    const timestamp = Date.now().toString(); // 현재 타임스탬프를 문자열로 변환
    const hash = crypto.createHash('md5').update(timestamp).digest('hex'); // 타임스탬프를 MD5 해시로 변환
    return `${roomName}-${hash.substring(0, 6)}`; // 방 이름과 해시의 앞 6자리를 결합하여 고유한 방 ID 생성
  }

  // 모든 방을 가져오는 메서드
  private getTotalRooms() {
    return this.server.sockets.adapter.rooms; // 서버의 모든 방을 반환
  }

  // 클라이언트가 연결되었을 때 호출되는 메서드
  handleConnection(socket: Socket) {
    console.log(`New client connected with id: ${socket.id}`); // 새로운 클라이언트 연결 로그 출력
  }

  // 클라이언트가 연결 해제되었을 때 호출되는 메서드
  handleDisconnect(socket: Socket) {
    console.log(`Client disconnected: ${socket.id}`); // 클라이언트 연결 해제 로그 출력
  }

  // 'create_room' 메시지를 처리하는 메서드
  @SubscribeMessage('create_room')
  handleCreateRoom(
    @MessageBody() roomName: string, // 메시지 본문에서 방 이름을 가져옴
    @ConnectedSocket() socket: Socket, // 연결된 소켓을 가져옴
  ): void {
    const uniqueRoomId = this.generateUniqueRoomId(roomName); // 고유한 방 ID 생성
    socket.join(uniqueRoomId); // 소켓을 생성된 방에 추가
    console.log(`Socket ${socket.id} created and joined room: ${uniqueRoomId}`); // 방 생성 및 참여 로그 출력
    socket.emit('room_created', uniqueRoomId); // 클라이언트에게 방 생성 완료 메시지 전송
  }

  // 'join_room' 메시지를 처리하는 메서드
  @SubscribeMessage('join_room')
  handleJoinRoom(
    @MessageBody() roomId: string, // 메시지 본문에서 방 ID를 가져옴
    @ConnectedSocket() socket: Socket, // 연결된 소켓을 가져옴
  ): void {
    const room = this.getTotalRooms().get(roomId); // 방 ID로 방을 가져옴
    const userRequestRoomSize = room ? room.size : 0; // 방의 크기를 가져옴

    if (userRequestRoomSize >= 2) {
      // 방에 사용자가 2명 이상인 경우
      socket.emit('maximum-user'); // 최대 사용자 수 초과 메시지 전송
    } else {
      socket.join(roomId); // 소켓을 방에 추가
      console.log(`Socket ${socket.id} joined room: ${roomId}`); // 방 참여 로그 출력
      socket.emit('room_joined'); // 클라이언트에게 방 참여 완료 메시지 전송
      socket.to(roomId).emit('user_joined', socket.id); // 방에 있는 다른 사용자에게 새로운 사용자 참여 메시지 전송
    }
  }

  // 'chat_message' 메시지를 처리하는 메서드
  @SubscribeMessage('chat_message')
  handleChatMessage(
    @MessageBody() chatInfo: { room: string; message: string }, // 메시지 본문에서 채팅 정보를 가져옴
    @ConnectedSocket() socket: Socket, // 연결된 소켓을 가져옴
  ): void {
    console.log('User sent message', chatInfo); // 채팅 메시지 로그 출력
    socket.to(chatInfo.room).emit('send_message', chatInfo); // 방에 있는 다른 사용자에게 채팅 메시지 전송
  }
}

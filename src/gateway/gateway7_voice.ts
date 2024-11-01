import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

/**
 * 경매 관련 이벤트를 처리하는 WebSocket 게이트웨이.
 * 이 게이트웨이는 '/auction-execute' 네임스페이스에서 작동.
 */
@WebSocketGateway({ namespace: '/auction-execute' })
export class AuctionVoiceGateway {
  @WebSocketServer() server: Server;

  /**
   * 음성 데이터 처리
   * 같은 room 사용자 모두에게 전송
   * @param voiceData
   */
  @SubscribeMessage('audio')
  handleAudio(
    @MessageBody()
    voiceData: {
      data: Blob;
      userId: string;
      auctionId: string;
      nickname: string;
    },
  ) {
    const { data, auctionId, userId, nickname } = voiceData;
    const message = `New voice message from ${nickname}`;
    const messageData = { auctionId, userId, nickname, message };
    this.server.to(auctionId).emit('audioPlay', data);
    this.server.to(auctionId).emit('message', messageData);
  }

  /**
   * 새로운 클라이언트 연결을 확인
   *
   * @param socket - 클라이언트 소켓.
   */
  handleConnection(socket: Socket) {
    console.log(`Client connected: ${socket.id}`);
  }

  /**
   * 클라이언트 연결 해제를 확인
   *
   * @param socket - 클라이언트 소켓.
   */
  handleDisconnect(socket: Socket) {
    console.log(`Client disconnected: ${socket.id}`);
  }
}

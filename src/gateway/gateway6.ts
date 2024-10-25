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
export class AuctionGateway {
  @WebSocketServer() server: Server;

  private currentBids: { [auctionId: string]: number } = {};

  /**
   * 'join_auction' 이벤트를 처리.
   * 클라이언트를 지정된 경매 방에 추가하고 현재 최고 입찰가를 전송.
   *
   * @param socket - 클라이언트 소켓.
   * @param auctionId - 참여할 경매 방의 ID.
   */
  @SubscribeMessage('join_auction')
  handleJoinAuction(socket: Socket, auctionId: string): void {
    socket.join(auctionId);
    console.log(`Client ${socket.id} joined auction ${auctionId}`);

    if (this.currentBids[auctionId] == null) {
      this.currentBids[auctionId] = 50000;
    }

    const currentBid = this.currentBids[auctionId];
    socket.emit('current_bid', currentBid);
  }

  /**
   * 'message' 이벤트를 처리.
   * 지정된 경매 방의 모든 클라이언트에게 메시지를 전송.
   *
   * @param socket - 클라이언트 소켓.
   * @param data - auctionId, userId, message를 포함한 메시지 데이터.
   */
  @SubscribeMessage('message')
  handleMessage(
    socket: Socket,
    data: { auctionId: string; userId: string; message: string },
  ): void {
    const { auctionId, userId, message } = data;
    this.server.to(auctionId).emit('message', `${userId}: ${message}`);
  }

  /**
   * 'new_bid' 이벤트를 처리.
   * 새로운 입찰가가 현재 입찰가보다 높으면 현재 입찰가를 업데이트.
   *
   * @param bidData - auctionId와 newCurrentBid를 포함한 입찰 데이터.
   * @param socket - 클라이언트 소켓.
   */
  @SubscribeMessage('new_bid')
  handleNewBid(
    @MessageBody() bidData: { auctionId: string; newCurrentBid: number },
    @ConnectedSocket() socket: Socket,
  ) {
    const { auctionId, newCurrentBid } = bidData;

    if (newCurrentBid > this.currentBids[auctionId]) {
      this.currentBids[auctionId] = newCurrentBid;
      this.server.to(auctionId).emit('bid_updated', newCurrentBid);
      console.log(
        `Auction ${auctionId} has a new highest bid: ${newCurrentBid}`,
      );
    } else {
      socket.emit(
        'bid_error',
        'Bid must be higher than the current highest bid.',
      );
    }
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

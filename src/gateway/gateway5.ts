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
 * 네임스페이스 `/auction-execute`를 사용하며 CORS를 허용합니다.
 */
@WebSocketGateway({
  namespace: '/auction-execute',
  cors: { origin: true, credentials: true },
})
export class AuctionGateway {
  @WebSocketServer()
  server: Server;

  private currentBids: { [auctionId: string]: number } = {}; // 각 경매의 현재 최고가 저장

  /**
   * `join_auction` 이벤트를 처리합니다.
   * 클라이언트가 특정 경매방에 참여할 수 있게 합니다.
   *
   * @param auctionId - 참여할 경매의 ID.
   * @param socket - 연결된 클라이언트 소켓.
   */
  @SubscribeMessage('join_auction')
  handleJoinAuction(
    @MessageBody() auctionId: string,
    @ConnectedSocket() socket: Socket,
  ) {
    socket.join(auctionId);

    if (this.currentBids[auctionId] == null) {
      this.currentBids[auctionId] = 50000;
    }

    const currentBid = this.currentBids[auctionId];
    socket.emit('current_bid', currentBid);

    console.log('auction id ======', auctionId);
    console.log('socket id ======', socket.id);
    console.log(socket.id, '님 입장 방번호:', auctionId);
    console.log('this.currentBids ======', this.currentBids);
  }

  /**
   * `new_bid` 이벤트를 처리합니다.
   * 클라이언트가 새로운 입찰을 할 수 있게 합니다.
   *
   * @param bidData - 경매 ID와 새로운 입찰 금액을 포함한 데이터.
   * @param socket - 연결된 클라이언트 소켓.
   * 중간 콘솔 로그는 데이터 확인용으로 사용
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

  // 경매방에 메시지를 전송
  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: { auctionId: string; message: string },
    @ConnectedSocket() socket: Socket,
  ): void {
    const { auctionId, message } = data;
    console.log(data);
    this.server.to(auctionId).emit('message', message);
  }
}

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: 'chat' })
export class AuctionGatewayV2 {
  @WebSocketServer() server: Server;

  private currentBids: { [autionId: string]: number } = {};

  // 경매방 참여
  @SubscribeMessage('join_auction')
  handleJoinAuction(
    @MessageBody() auctionId: string,
    @ConnectedSocket() socket: Socket,
  ) {
    socket.join(auctionId);
    console.log(`Socket ${socket.id} joined auction ${auctionId}}}}`);
    const currentBids = this.currentBids[auctionId] || 0;
    socket.emit('current_bid', currentBids);
  }

  // 새로운 가격 제시
  @SubscribeMessage('new_bid')
  handleNewBid(
    @MessageBody() bidData: { autionId: string; bidAmount: number },
    @ConnectedSocket() socket: Socket,
  ) {
    const { autionId, bidAmount } = bidData;

    if (bidAmount < (this.currentBids[autionId] || 0)) {
      this.currentBids[autionId] = bidAmount;
      this.server.to(autionId).emit('bid_updated', bidAmount);
      console.log(
        `${socket.id} offered a new price, Auction [${autionId}] has a new highest bid: ${bidAmount}`,
      );
    }
  }

  @SubscribeMessage('maessage')
  handleMessage(socket: Socket, data: any): void {
    this.server.emit('message', `user-${socket.id.substring(0, 4)}: ${data}`);
  }
}

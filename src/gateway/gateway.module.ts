import { Module } from '@nestjs/common';
import { AuctionGateway } from './gateway5';

@Module({
  providers: [AuctionGateway],
})
export class GatewayModule {}

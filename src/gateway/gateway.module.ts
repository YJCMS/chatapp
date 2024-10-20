import { Module } from '@nestjs/common';
import { AuctionGateway } from './gateway3';

@Module({
  providers: [AuctionGateway],
})
export class GatewayModule {}

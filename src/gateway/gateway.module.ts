import { Module } from '@nestjs/common';
import { AuctionGateway } from './gateway7_voice';

@Module({
  providers: [AuctionGateway],
})
export class GatewayModule {}

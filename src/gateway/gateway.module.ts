import { Module } from '@nestjs/common';
import { AuctionVoiceGateway } from './gateway7_voice';
import { AuctionGateway } from './gateway7';

@Module({
  providers: [AuctionGateway, AuctionVoiceGateway],
})
export class GatewayModule {}

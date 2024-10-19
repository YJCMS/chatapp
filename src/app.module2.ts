import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// import { GatewayModule } from './gateway/gateway.module'; // Remove this line for use SocketModule
import { SocketModule } from './socket/socket.module';

@Module({
  imports: [SocketModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule2 {}

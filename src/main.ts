import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { AppModule2 } from './app.module2';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  console.log('Server listening on http://localhost:3000');

  // // Gateway app
  // const app = await NestFactory.create(AppModule);
  // await app.listen(process.env.PORT ?? 3000);
  // console.log(`Application is running on: ${await app.getUrl()}`);
  //
  // // Create another app, Connect to WebSocketServer from another Nest api
  // const app2 = await NestFactory.create(AppModule2);
  // await app2.listen(process.env.PORT2 ?? 3001);
  // console.log(`Application2 is running on: ${await app2.getUrl()}`);
}
bootstrap();

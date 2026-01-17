import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(process.env.PORT ?? 3003);
  console.log(`Gateway is running on: http://localhost:3003/graphql`);
}
bootstrap();

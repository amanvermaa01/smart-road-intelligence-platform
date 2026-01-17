import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Connect Kafka Microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
      },
      consumer: {
        groupId: 'analytics-consumer',
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3004);
  console.log(`Analytics Service is running on: ${await app.getUrl()}`);
}
bootstrap();
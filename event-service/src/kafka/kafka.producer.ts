import { Injectable, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaProducer implements OnModuleInit {
  private producer: Producer;

  async onModuleInit() {
    const kafka = new Kafka({
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
      clientId: 'event-service',
    });

    this.producer = kafka.producer();
    await this.producer.connect();
  }

  async publishRoadEvent(payload: any) {
    await this.producer.send({
      topic: 'road-events',
      messages: [
        {
          key: payload.id,
          value: JSON.stringify(payload),
        },
      ],
    });
  }
}

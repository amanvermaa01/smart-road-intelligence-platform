import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { Kafka, Producer } from "kafkajs";
import kafkaConfig from "../config/kafka.config";

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private producer: Producer;

  async onModuleInit() {
    const { clientId, brokers } = kafkaConfig().kafka;

    const kafka = new Kafka({
      clientId,
      brokers,
      retry: {
        retries: 5,
      },
    });

    this.producer = kafka.producer({
      allowAutoTopicCreation: true,
      idempotent: true,
    });

    await this.producer.connect();
  }

  async emit(topic: string, key: string, message: object) {
    await this.producer.send({
      topic,
      messages: [
        {
          key,
          value: JSON.stringify(message),
        },
      ],
    });
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }
}

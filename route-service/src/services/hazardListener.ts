import { Kafka } from 'kafkajs';
import { onHazardUpdated } from '../events/hazard.consumer';

export async function startHazardListener() {
  const kafka = new Kafka({
    clientId: 'route-service',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
  });

  const consumer = kafka.consumer({ groupId: 'route-group' });

  await consumer.connect();
  await consumer.subscribe({ topic: 'events.scored', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;
      try {
        const event = JSON.parse(message.value.toString());
        // event-service payload: { id, severity, ... }
        // ml-service payload: { id, type, confidence_score, severity, ... }
        
        await onHazardUpdated({
          hazardId: event.id || event.event_id,
          severity: event.severity,
          lat: event.lat,
          lng: event.lng,
          type: event.type,
        });
        
        console.log(`[HazardListener] Processed hazard ${event.id}`);
      } catch (err) {
        console.error('[HazardListener] Error processing message:', err);
      }
    },
  });
}

export default () => ({
  kafka: {
    clientId: 'event-service',
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  },
});

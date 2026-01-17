import { RedisPubSub } from 'graphql-redis-subscriptions';

export const redisPubSub = new RedisPubSub({
  connection: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT) || 6379,
  },
});

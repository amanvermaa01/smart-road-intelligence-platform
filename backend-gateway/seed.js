const Redis = require('ioredis');
const redis = new Redis('redis://localhost:6379');

async function seed() {
  const routeId = 'route-1';
  
  // 1. Seed Hazard Summary
  const summaryKey = `route:${routeId}:hazards:summary`;
  await redis.hset(summaryKey, {
    pothole: 5,
    accident: 2,
    waterlogging: 1
  });

  // 2. Seed Event Feed
  const feedKey = `route:${routeId}:events:latest`;
  const events = [
    { id: '1', type: 'pothole', severity: 2, timestamp: Date.now() - 100000 },
    { id: '2', type: 'accident', severity: 4, timestamp: Date.now() - 50000 },
    { id: '3', type: 'waterlogging', severity: 3, timestamp: Date.now() }
  ];

  await redis.del(feedKey);
  for (const e of events) {
    await redis.zadd(feedKey, e.timestamp, JSON.stringify(e));
  }

  // 3. Publish an alert
  const alert = {
    id: 'alert-' + Date.now(),
    message: 'New accident reported on your route!',
    severity: 4,
    routeId: routeId,
    createdAt: new Date().toISOString()
  };
  
  await redis.publish('alerts:publish', JSON.stringify(alert));

  console.log('Seeded mock data in Redis');
  process.exit(0);
}

seed();

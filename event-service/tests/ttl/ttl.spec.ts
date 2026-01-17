import { Redis } from 'ioredis';

describe('TTL Expiration Test', () => {
    let redis: Redis;

    beforeAll(() => {
        redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    });

    afterAll(async () => {
        await redis.quit();
    });

    it('should expire and remove event after TTL', async () => {
        const id = 'test-event-ttl-' + Date.now();
        const expiresInSeconds = 2; // Short TTL for test
        
        await redis.set(`events:data:${id}`, JSON.stringify({ id, type: 'test' }), 'EX', expiresInSeconds);
        
        let exists = await redis.exists(`events:data:${id}`);
        expect(exists).toBe(1);

        // Wait for TTL + small buffer
        await new Promise(r => setTimeout(r, (expiresInSeconds + 1) * 1000));

        exists = await redis.exists(`events:data:${id}`);
        expect(exists).toBe(0);
    }, 10000);
});

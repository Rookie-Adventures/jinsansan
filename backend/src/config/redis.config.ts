import { createClient } from 'redis';

let redisClient: ReturnType<typeof createClient> | null = null;

export const getRedisClient = () => {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error', err);
    });
  }
  return redisClient;
};

export const connectRedis = async () => {
  const client = getRedisClient();
  if (!client.isOpen) {
    await client.connect();
  }
  return client;
};

export default {
  getRedisClient,
  connectRedis
}; 
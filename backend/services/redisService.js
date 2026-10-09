const { createClient } = require('redis');

let redisClient;

const connectRedis = async () => {
  redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

  redisClient.on('error', (err) => console.log('Redis Client Error', err));

  await redisClient.connect();
  console.log('Redis connected');
};

const getRedisClient = () => redisClient;

module.exports = { connectRedis, getRedisClient };

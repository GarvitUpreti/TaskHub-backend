// src/config/redis.js
import Redis from 'ioredis';

const redisClient = new Redis({
  host: '127.0.0.1', // Redis server IP
  port: 6379,        // Redis default port
  password: '',      // if your Redis has a password
});

redisClient.on('connect', () => console.log('✅ Redis connected'));
redisClient.on('error', (err) => console.log('❌ Redis error:', err));

export default redisClient;

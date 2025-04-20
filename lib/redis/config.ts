import { Redis } from '@upstash/redis'
import { createClient, RedisClientType } from 'redis'

export type RedisConfig = {
  useLocalRedis: boolean
  upstashRedisRestUrl?: string
  upstashRedisRestToken?: string
  localRedisUrl?: string
}

export const redisConfig: RedisConfig = {
  useLocalRedis: process.env.USE_LOCAL_REDIS === 'true',
  upstashRedisRestUrl: process.env.UPSTASH_REDIS_REST_URL,
  upstashRedisRestToken: process.env.UPSTASH_REDIS_REST_TOKEN,
  localRedisUrl: process.env.LOCAL_REDIS_URL || 'redis://localhost:6379'
}

let localRedisClient: RedisClientType | null = null
let redisWrapper: RedisWrapper | null = null

// Simple in-memory fallback storage
let memoryStore: Record<string, Record<string, string>> = {};

// Memory store wrapper class that mimics RedisWrapper
class MemoryStoreWrapper {
  async zrange(key: string, start: number, stop: number, options?: { rev: boolean }): Promise<string[]> {
    return [];
  }

  async hgetall<T extends Record<string, unknown>>(key: string): Promise<T | null> {
    return (memoryStore[key] as T) || null;
  }

  pipeline() {
    return {
      hgetall: () => this,
      del: () => this,
      zrem: () => this,
      hmset: () => this,
      zadd: () => this,
      exec: async () => []
    };
  }

  async hmset(key: string, value: Record<string, any>): Promise<'OK'> {
    if (!memoryStore[key]) {
      memoryStore[key] = {};
    }
    
    Object.entries(value).forEach(([field, val]) => {
      memoryStore[key][field] = String(val);
    });
    
    return 'OK';
  }

  async zadd(key: string, score: number, member: string): Promise<number> {
    return 1;
  }

  async del(key: string): Promise<number> {
    if (memoryStore[key]) {
      delete memoryStore[key];
      return 1;
    }
    return 0;
  }

  async zrem(key: string, member: string): Promise<number> {
    return 0;
  }

  async close(): Promise<void> {
    // No need to close in-memory store
  }
}

// Wrapper class for Redis client
export class RedisWrapper {
  private client: Redis | RedisClientType

  constructor(client: Redis | RedisClientType) {
    this.client = client
  }

  async zrange(
    key: string,
    start: number,
    stop: number,
    options?: { rev: boolean }
  ): Promise<string[]> {
    let result: string[]
    if (this.client instanceof Redis) {
      result = await this.client.zrange(key, start, stop, options)
    } else {
      const redisClient = this.client as RedisClientType
      if (options?.rev) {
        result = await redisClient.zRange(key, start, stop, { REV: true })
      } else {
        result = await redisClient.zRange(key, start, stop)
      }
    }
    return result
  }

  async hgetall<T extends Record<string, unknown>>(
    key: string
  ): Promise<T | null> {
    if (this.client instanceof Redis) {
      return this.client.hgetall(key) as Promise<T | null>
    } else {
      const result = await (this.client as RedisClientType).hGetAll(key)
      return Object.keys(result).length > 0 ? (result as T) : null
    }
  }

  pipeline() {
    return this.client instanceof Redis
      ? new UpstashPipelineWrapper(this.client.pipeline())
      : new LocalPipelineWrapper((this.client as RedisClientType).multi())
  }

  async hmset(key: string, value: Record<string, any>): Promise<'OK' | number> {
    if (this.client instanceof Redis) {
      return this.client.hmset(key, value)
    } else {
      return (this.client as RedisClientType).hSet(key, value)
    }
  }

  async zadd(
    key: string,
    score: number,
    member: string
  ): Promise<number | null> {
    if (this.client instanceof Redis) {
      return this.client.zadd(key, { score, member })
    } else {
      return (this.client as RedisClientType).zAdd(key, {
        score,
        value: member
      })
    }
  }

  async del(key: string): Promise<number> {
    if (this.client instanceof Redis) {
      return this.client.del(key)
    } else {
      return (this.client as RedisClientType).del(key)
    }
  }

  async zrem(key: string, member: string): Promise<number> {
    if (this.client instanceof Redis) {
      return this.client.zrem(key, member)
    } else {
      return (this.client as RedisClientType).zRem(key, member)
    }
  }

  async close(): Promise<void> {
    if (this.client instanceof Redis) {
      // Upstash Redis doesn't require explicit closing
      return
    } else {
      await (this.client as RedisClientType).quit()
    }
  }
}

// Wrapper class for Upstash Redis pipeline
class UpstashPipelineWrapper {
  private pipeline: ReturnType<Redis['pipeline']>

  constructor(pipeline: ReturnType<Redis['pipeline']>) {
    this.pipeline = pipeline
  }

  hgetall(key: string) {
    this.pipeline.hgetall(key)
    return this
  }

  del(key: string) {
    this.pipeline.del(key)
    return this
  }

  zrem(key: string, member: string) {
    this.pipeline.zrem(key, member)
    return this
  }

  hmset(key: string, value: Record<string, any>) {
    this.pipeline.hmset(key, value)
    return this
  }

  zadd(key: string, score: number, member: string) {
    this.pipeline.zadd(key, { score, member })
    return this
  }

  async exec() {
    try {
      return await this.pipeline.exec()
    } catch (error) {
      throw error
    }
  }
}

// Wrapper class for local Redis pipeline
class LocalPipelineWrapper {
  private pipeline: ReturnType<RedisClientType['multi']>

  constructor(pipeline: ReturnType<RedisClientType['multi']>) {
    this.pipeline = pipeline
  }

  hgetall(key: string) {
    this.pipeline.hGetAll(key)
    return this
  }

  del(key: string) {
    this.pipeline.del(key)
    return this
  }

  zrem(key: string, member: string) {
    this.pipeline.zRem(key, member)
    return this
  }

  hmset(key: string, value: Record<string, any>) {
    // Convert all values to strings
    const stringValue = Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, String(v)])
    )
    this.pipeline.hSet(key, stringValue)
    return this
  }

  zadd(key: string, score: number, member: string) {
    this.pipeline.zAdd(key, { score, value: member })
    return this
  }

  async exec() {
    try {
      return await this.pipeline.exec()
    } catch (error) {
      throw error
    }
  }
}

// Function to get a Redis client
export async function getRedisClient(): Promise<RedisWrapper> {
  if (redisWrapper) {
    return redisWrapper;
  }

  if (redisConfig.useLocalRedis) {
    if (!localRedisClient) {
      const localRedisUrl = redisConfig.localRedisUrl || 'redis://localhost:6379';
      try {
        localRedisClient = createClient({ url: localRedisUrl });
        await localRedisClient.connect();
        redisWrapper = new RedisWrapper(localRedisClient);
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('ECONNREFUSED')) {
            console.warn(`Failed to connect to local Redis at ${localRedisUrl}: Connection refused. Using in-memory fallback.`);
          } else if (error.message.includes('ETIMEDOUT')) {
            console.warn(`Failed to connect to local Redis at ${localRedisUrl}: Connection timed out. Using in-memory fallback.`);
          } else if (error.message.includes('ENOTFOUND')) {
            console.warn(`Failed to connect to local Redis at ${localRedisUrl}: Host not found. Using in-memory fallback.`);
          } else {
            console.warn(`Failed to connect to local Redis at ${localRedisUrl}: ${error.message}. Using in-memory fallback.`);
          }
        } else {
          console.warn(`An unexpected error occurred while connecting to local Redis at ${localRedisUrl}. Using in-memory fallback.`);
        }
        
        console.info('Using in-memory storage as Redis fallback. Note: Data will be lost on server restart.');
        redisWrapper = new MemoryStoreWrapper() as unknown as RedisWrapper;
        return redisWrapper;
      }
    } else {
      redisWrapper = new RedisWrapper(localRedisClient);
    }
  } else {
    if (!redisConfig.upstashRedisRestUrl || !redisConfig.upstashRedisRestToken) {
      console.warn('Upstash Redis configuration is missing. Using in-memory fallback.');
      redisWrapper = new MemoryStoreWrapper() as unknown as RedisWrapper;
      return redisWrapper;
    }
    
    try {
      redisWrapper = new RedisWrapper(
        new Redis({
          url: redisConfig.upstashRedisRestUrl,
          token: redisConfig.upstashRedisRestToken
        })
      );
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('unauthorized')) {
          console.warn('Failed to connect to Upstash Redis: Unauthorized. Using in-memory fallback.');
        } else if (error.message.includes('not found')) {
          console.warn('Failed to connect to Upstash Redis: URL not found. Using in-memory fallback.');
        } else {
          console.warn(`Failed to connect to Upstash Redis: ${error.message}. Using in-memory fallback.`);
        }
      } else {
        console.warn('An unexpected error occurred while connecting to Upstash Redis. Using in-memory fallback.');
      }
      
      console.info('Using in-memory storage as Redis fallback. Note: Data will be lost on server restart.');
      redisWrapper = new MemoryStoreWrapper() as unknown as RedisWrapper;
    }
  }

  return redisWrapper;
}

// Function to close the Redis connection
export async function closeRedisConnection(): Promise<void> {
  if (redisWrapper) {
    await redisWrapper.close()
    redisWrapper = null
  }
  if (localRedisClient) {
    await localRedisClient.quit()
    localRedisClient = null
  }
}

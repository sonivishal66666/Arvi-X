function getRedis() {
  return require('../index').redis;
}

const DEFAULT_TTL = 300;

export const cacheGet = async <T>(key: string): Promise<T | null> => {
  try {
    const data = await getRedis().get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const cacheSet = async (
  key: string,
  value: any,
  ttl = DEFAULT_TTL,
): Promise<void> => {
  try {
    await getRedis().set(key, JSON.stringify(value), 'EX', ttl);
  } catch (error) {
    console.error('Redis cache set error:', error);
  }
};

export const cacheDel = async (key: string): Promise<void> => {
  try {
    await getRedis().del(key);
  } catch (error) {
    console.error('Redis cache del error:', error);
  }
};

export const cacheDelPattern = async (pattern: string): Promise<void> => {
  try {
    const keys = await getRedis().keys(pattern);
    if (keys.length > 0) {
      await getRedis().del(...keys);
    }
  } catch (error) {
    console.error('Redis cache del pattern error:', error);
  }
};

export const acquireLock = async (
  key: string,
  ttl = 30,
): Promise<boolean> => {
  const result = await getRedis().set(key, 'locked', 'EX', ttl, 'NX');
  return result === 'OK';
};

export const releaseLock = async (key: string): Promise<void> => {
  await getRedis().del(key);
};

export const incrementCounter = async (key: string, ttl = 86400): Promise<number> => {
  const count = await getRedis().incr(key);
  if (count === 1) {
    await getRedis().expire(key, ttl);
  }
  return count;
};

export const addToQueue = async (queue: string, data: any): Promise<void> => {
  await getRedis().lpush(queue, JSON.stringify(data));
};

export const getFromQueue = async <T>(queue: string): Promise<T | null> => {
  const data = await getRedis().rpop(queue);
  return data ? JSON.parse(data) : null;
};

export const getQueueLength = async (queue: string): Promise<number> => {
  return getRedis().llen(queue);
};

export const rateLimiter = async (
  key: string,
  maxRequests: number,
  windowMs: number,
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> => {
  const now = Date.now();
  const windowKey = `${key}:${Math.floor(now / windowMs)}`;
  const count = await getRedis().incr(windowKey);

  if (count === 1) {
    await getRedis().expire(windowKey, Math.ceil(windowMs / 1000));
  }

  return {
    allowed: count <= maxRequests,
    remaining: Math.max(0, maxRequests - count),
    resetTime: Math.ceil(now / windowMs) * windowMs + windowMs,
  };
};

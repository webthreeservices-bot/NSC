/**
 * Caching Utility
 * Provides in-memory and Redis caching capabilities
 */

import { createClient, RedisClientType } from 'redis'

// In-memory cache fallback
const memoryCache = new Map<string, { value: any; expiry: number }>()

// Redis client (optional - falls back to memory if not configured)
let redisClient: RedisClientType | null = null
let isRedisConnected = false

/**
 * Initialize Redis client (optional)
 */
export async function initRedisCache() {
  if (process.env.REDIS_URL) {
    try {
      redisClient = createClient({
        url: process.env.REDIS_URL,
      })

      redisClient.on('error', (err) => {
        console.error('[Cache] Redis error:', err)
        isRedisConnected = false
      })

      redisClient.on('connect', () => {
        console.log('[Cache] Redis connected')
        isRedisConnected = true
      })

      await redisClient.connect()
    } catch (error) {
      console.error('[Cache] Failed to connect to Redis:', error)
      console.log('[Cache] Falling back to in-memory cache')
      redisClient = null
    }
  } else {
    console.log('[Cache] No REDIS_URL configured, using in-memory cache')
  }
}

/**
 * Set cache value
 */
export async function setCache(
  key: string,
  value: any,
  ttlSeconds: number = 300 // 5 minutes default
): Promise<void> {
  try {
    const stringValue = JSON.stringify(value)

    // Try Redis first
    if (redisClient && isRedisConnected) {
      await redisClient.setEx(key, ttlSeconds, stringValue)
      return
    }

    // Fallback to memory cache
    const expiry = Date.now() + ttlSeconds * 1000
    memoryCache.set(key, { value: stringValue, expiry })
  } catch (error) {
    console.error('[Cache] Error setting cache:', error)
  }
}

/**
 * Get cache value
 */
export async function getCache<T = any>(key: string): Promise<T | null> {
  try {
    // Try Redis first
    if (redisClient && isRedisConnected) {
      const value = await redisClient.get(key)
      return value ? JSON.parse(value) : null
    }

    // Fallback to memory cache
    const cached = memoryCache.get(key)
    if (!cached) return null

    // Check expiry
    if (Date.now() > cached.expiry) {
      memoryCache.delete(key)
      return null
    }

    return JSON.parse(cached.value)
  } catch (error) {
    console.error('[Cache] Error getting cache:', error)
    return null
  }
}

/**
 * Delete cache value
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    // Try Redis first
    if (redisClient && isRedisConnected) {
      await redisClient.del(key)
      return
    }

    // Fallback to memory cache
    memoryCache.delete(key)
  } catch (error) {
    console.error('[Cache] Error deleting cache:', error)
  }
}

/**
 * Delete cache by pattern (Redis only)
 */
export async function deleteCachePattern(pattern: string): Promise<void> {
  try {
    if (redisClient && isRedisConnected) {
      const keys = await redisClient.keys(pattern)
      if (keys.length > 0) {
        await redisClient.del(keys)
      }
      return
    }

    // For memory cache, delete matching keys
    for (const key of memoryCache.keys()) {
      if (key.includes(pattern.replace('*', ''))) {
        memoryCache.delete(key)
      }
    }
  } catch (error) {
    console.error('[Cache] Error deleting cache pattern:', error)
  }
}

/**
 * Clear all cache
 */
export async function clearCache(): Promise<void> {
  try {
    if (redisClient && isRedisConnected) {
      await redisClient.flushAll()
      return
    }

    memoryCache.clear()
  } catch (error) {
    console.error('[Cache] Error clearing cache:', error)
  }
}

/**
 * Cache wrapper for functions
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  // Try to get from cache
  const cached = await getCache<T>(key)
  if (cached !== null) {
    return cached
  }

  // Execute function and cache result
  const result = await fn()
  await setCache(key, result, ttlSeconds)
  return result
}

/**
 * Cache key generators
 */
export const CacheKeys = {
  user: (userId: string) => `user:${userId}`,
  userPackages: (userId: string) => `user:${userId}:packages`,
  userTransactions: (userId: string) => `user:${userId}:transactions`,
  userEarnings: (userId: string) => `user:${userId}:earnings`,
  userReferrals: (userId: string) => `user:${userId}:referrals`,
  packageStats: () => 'stats:packages',
  dashboardStats: (userId: string) => `dashboard:${userId}`,
  adminStats: () => 'admin:stats',
  botActivations: (userId: string) => `user:${userId}:bots`,
  paymentAddress: (network: string) => `payment:address:${network}`,
}

/**
 * Cache TTL presets (in seconds)
 */
export const CacheTTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 900, // 15 minutes
  HOUR: 3600, // 1 hour
  DAY: 86400, // 24 hours
}

/**
 * Cleanup expired memory cache entries (runs periodically)
 */
function cleanupMemoryCache() {
  const now = Date.now()
  for (const [key, entry] of memoryCache.entries()) {
    if (now > entry.expiry) {
      memoryCache.delete(key)
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupMemoryCache, 5 * 60 * 1000)

export default {
  init: initRedisCache,
  set: setCache,
  get: getCache,
  delete: deleteCache,
  deletePattern: deleteCachePattern,
  clear: clearCache,
  withCache,
  keys: CacheKeys,
  ttl: CacheTTL,
}

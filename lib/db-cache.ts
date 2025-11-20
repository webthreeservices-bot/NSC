interface CacheEntry<T> {
  data: T
  timestamp: number
}

export class DatabaseCache {
  private static instance: DatabaseCache
  private cache: Map<string, CacheEntry<any>>
  private readonly defaultTTL: number

  private constructor() {
    this.cache = new Map()
    this.defaultTTL = 60000 // 1 minute default TTL
  }

  static getInstance(): DatabaseCache {
    if (!DatabaseCache.instance) {
      DatabaseCache.instance = new DatabaseCache()
    }
    return DatabaseCache.instance
  }

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now() + ttl
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() > entry.timestamp) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp) {
        this.cache.delete(key)
      }
    }
  }

  // Generate cache key from query parameters
  generateKey(model: string, operation: string, params: any): string {
    return `${model}:${operation}:${JSON.stringify(params)}`
  }
}

// Start cleanup interval
setInterval(() => {
  const instance = DatabaseCache.getInstance()
  instance.cleanup()
}, 60000) // Run cleanup every minute

export default DatabaseCache.getInstance()
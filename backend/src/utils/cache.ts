/**
 * Simple in-memory cache with TTL support
 * For production, consider Redis, but this is optimal for lightweight dev/staging
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private timers = new Map<string, NodeJS.Timeout>();

  /**
   * Set value with TTL (time-to-live in milliseconds)
   */
  set<T>(key: string, value: T, ttlMs: number = 5000): void {
    // Clear existing timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key)!);
    }

    const expiresAt = Date.now() + ttlMs;
    this.cache.set(key, { value, expiresAt });

    // Auto-delete on expiry
    const timer = setTimeout(() => {
      this.cache.delete(key);
      this.timers.delete(key);
    }, ttlMs);

    this.timers.set(key, timer);
  }

  /**
   * Get value if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Delete specific key
   */
  delete(key: string): void {
    this.cache.delete(key);
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key)!);
      this.timers.delete(key);
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.cache.clear();
    this.timers.clear();
  }

  /**
   * Get cache stats for debugging
   */
  getStats() {
    return {
      size: this.cache.size,
      memory: process.memoryUsage().heapUsed,
    };
  }
}

export const cache = new CacheManager();

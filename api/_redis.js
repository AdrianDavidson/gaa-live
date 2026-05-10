import { Redis } from '@upstash/redis'

// Returns a Redis client if env vars are set, otherwise a no-op stub.
// This lets the app run without Redis (no caching, but fully functional).
function makeRedis() {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return Redis.fromEnv()
  }
  return {
    get:  async () => null,
    set:  async () => null,
    del:  async () => null,
    keys: async () => [],
  }
}

export const redis = makeRedis()

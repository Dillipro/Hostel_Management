let cache;
const enableRedis = process.env.ENABLE_REDIS === 'true' || process.env.ENABLE_QUEUES === 'true';
if (enableRedis) {
  try {
    const IORedis = require('ioredis');
    const client = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });
    cache = {
      get: (k) => client.get(k),
      setex: (k, ttl, v) => client.setex(k, ttl, v),
      del: (k) => client.del(k)
    };
  } catch {}
}
if (!cache) {
  const store = new Map();
  cache = {
    get: async (k) => store.get(k),
    setex: async (k, ttl, v) => { store.set(k, v); const t = setTimeout(() => store.delete(k), ttl * 1000); t.unref?.(); },
    del: async (k) => { store.delete(k); }
  };
}

module.exports = cache;

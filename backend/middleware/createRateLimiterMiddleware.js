function memoryRateLimiter({ windowMs = 60 * 1000, max = 100, keyGenerator = (req) => req.ip } = {}) {
  const store = new Map();

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!store.has(key)) store.set(key, []);
    const timestamps = store.get(key);

    while (timestamps.length && timestamps[0] <= windowStart) {
      timestamps.shift();
    }

    if (timestamps.length >= max) {
      const retryAfterSec = Math.ceil((timestamps[0] + windowMs - now) / 1000);
      res.set("Retry-After", String(retryAfterSec));
      res.set("X-RateLimit-Limit", String(max));
      res.set("X-RateLimit-Remaining", "0");
      res.set("X-RateLimit-Reset", String(Math.floor((now + retryAfterSec * 1000) / 1000)));
      return res.status(429).json({ message: "Çok fazla istek gönderdiniz" });
    }

    timestamps.push(now);

    res.set("X-RateLimit-Limit", String(max));
    res.set("X-RateLimit-Remaining", String(Math.max(0, max - timestamps.length)));
    res.set("X-RateLimit-Reset", String(Math.floor((now + windowMs) / 1000)));

    next();
  };
}

module.exports = { memoryRateLimiter };

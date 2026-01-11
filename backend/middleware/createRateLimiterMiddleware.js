setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of store.entries()) {
    if (timestamps.length === 0 || timestamps[timestamps.length - 1] < now - windowMs) {
      store.delete(key);
    }
  }
}, 30 * 60 * 1000); 

function memoryRateLimiter({ windowMs = 60 * 1000, max = 100, keyGenerator = (req) => req.ip } = {}) {
  const store = new Map();

  return (req, res, next) => {
    if (req.method === 'OPTIONS') {
      return next();
    }

    const key = keyGenerator(req);
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!store.has(key)) store.set(key, []);
    const timestamps = store.get(key);

    while (timestamps.length && timestamps[0] <= windowStart) {
      timestamps.shift();
    }

    if (timestamps.length >= max) {
      const origin = req.headers.origin;
      const allowedOrigins = [
        "http://localhost:8082", 
        "http://localhost:8080",
        "https://whats-cooking-seven.vercel.app"
      ];

      if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }

      const retryAfterSec = Math.ceil((timestamps[0] + windowMs - now) / 1000);
      res.set("Retry-After", String(retryAfterSec));
      
      return res.status(429).json({ 
        message: "Çok fazla istek gönderdiniz. Lütfen biraz bekleyin." 
      });
    }

    timestamps.push(now);
    next();
  };
}

module.exports = { memoryRateLimiter };

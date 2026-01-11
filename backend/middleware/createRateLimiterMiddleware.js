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
      res.set("X-RateLimit-Limit", String(max));
      res.set("X-RateLimit-Remaining", "0");
      res.set("X-RateLimit-Reset", String(Math.floor((now + retryAfterSec * 1000) / 1000)));
      
      return res.status(429).json({ message: "Çok fazla istek gönderdiniz. Lütfen biraz bekleyin. 🌿" });
    }

    timestamps.push(now);
    
    // Başarılı istekler için başlıkları ayarla
    res.set("X-RateLimit-Limit", String(max));
    res.set("X-RateLimit-Remaining", String(Math.max(0, max - timestamps.length)));
    res.set("X-RateLimit-Reset", String(Math.floor((now + windowMs) / 1000)));

    next();
  };
}

module.exports = { memoryRateLimiter };

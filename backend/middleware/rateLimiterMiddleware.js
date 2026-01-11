const { memoryRateLimiter } = require('./createRateLimiterMiddleware');

const getClientIp = (req) => {
    return req.headers['x-forwarded-for'] || req.ip;
};

const loginRateLimiter = memoryRateLimiter({
    windowMs: 10 * 60 * 1000,
    max: 40,
    keyGenerator: (req) => getClientIp(req)
});

const registerUserLimiter = memoryRateLimiter({
    windowMs: 10 * 60 * 1000, 
    max: 30,                   
    keyGenerator: (req) => getClientIp(req)
});

const generalRateLimiter = memoryRateLimiter({
    windowMs: 10 * 60 * 1000, 
    max: 100, // Genel limit biraz daha esnek olabilir
    keyGenerator: (req) => {
        // Eğer kullanıcı login ise ID'sini, değilse IP'sini kullan
        const userId = req.user ? req.user.id : 'anonymous';
        return `${userId}:${getClientIp(req)}`;
    }
});

module.exports = {
    loginRateLimiter,
    registerUserLimiter,
    generalRateLimiter
};
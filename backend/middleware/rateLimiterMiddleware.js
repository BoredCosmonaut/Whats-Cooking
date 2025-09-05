const { memoryRateLimiter } = require('./createRateLimiterMiddleware');

const loginRateLimiter = memoryRateLimiter({
    windowMs: 10 * 60 * 1000,
    max: 4,
    keyGenerator: (req) => req.ip
});

const registerUserLimiter = memoryRateLimiter({
    windowMs: 10 * 60 * 1000, 
    max: 3,                   
    keyGenerator: (req) => req.ip
});

const generalRateLimiter = memoryRateLimiter({
    windowMs: 10 * 60 * 1000, 
    max: 3,                   
    keyGenerator: (req) => `${req.user.id}:${req.ip}` 
});

module.exports = {
    loginRateLimiter,
    registerUserLimiter,
    generalRateLimiter
};
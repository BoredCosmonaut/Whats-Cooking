const { memoryRateLimiter } = require('./createRateLimiterMiddleware');

const loginRateLimiter = memoryRateLimiter({
    windowMs: 10 * 60 * 1000,
    max: 40,
    keyGenerator: (req) => req.ip
});

const registerUserLimiter = memoryRateLimiter({
    windowMs: 10 * 60 * 1000, 
    max: 30,                   
    keyGenerator: (req) => req.ip
});

const generalRateLimiter = memoryRateLimiter({
    windowMs: 10 * 60 * 1000, 
    max: 50,                   
    keyGenerator: (req) => `${req.user.id}:${req.ip}` 
});

module.exports = {
    loginRateLimiter,
    registerUserLimiter,
    generalRateLimiter
};
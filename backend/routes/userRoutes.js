const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const rateLimiter = require('../middleware/rateLimiterMiddleware');


router.post('/register', rateLimiter.registerUserLimiter,userController.registerUser);

router.post('/login', rateLimiter.loginRateLimiter, userController.loginUser);

module.exports = router;
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const rateLimiter = require('../middleware/rateLimiterMiddleware');
const dynamicUpload = require('../middleware/dynamicUploadMiddleware')

router.post('/register', rateLimiter.registerUserLimiter,userController.registerUser);

router.post('/login', rateLimiter.loginRateLimiter, userController.loginUser);

router.get('/info/:userId',authMiddleware,authorizeRoles('User','Admin'),userController.getUserInfoById);

router.put('/profileImage/update/:userId', authMiddleware,authorizeRoles('User','Admin'),dynamicUpload('profile').single('image'), userController.updateProfilePicture)
module.exports = router;
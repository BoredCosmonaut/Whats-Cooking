const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const rateLimiter = require('../middleware/rateLimiterMiddleware');
const {upload} = require('../middleware/dynamicUploadMiddleware')

router.post('/register', rateLimiter.registerUserLimiter,userController.registerUser);

router.post('/login', rateLimiter.loginRateLimiter, userController.loginUser);

router.post('/:id/points/adjust', authMiddleware,authorizeRoles('Admin'),userController.adjustUserPoints);

router.get('/top',userController.getTopChefs);

router.get('/clowns',userController.getClowns);

router.get('/verify-email', userController.verifyEmail);

router.get('/info/:userId',authMiddleware,authorizeRoles('User','Admin'),userController.getUserInfoById);

router.get('/:id/points',userController.getUserPoınts);

router.put('/profile/:id',authMiddleware,authorizeRoles('User','Admin'),rateLimiter.generalRateLimiter,userController.updateUserInfo);

router.put('/updatePassword/:id', authMiddleware,authorizeRoles('User','Admin'),rateLimiter.generalRateLimiter,userController.updatePassword);

router.put('/profileImage/update/:userId', authMiddleware,authorizeRoles('User','Admin'),upload.single('image'), userController.updateProfilePicture)


module.exports = router;
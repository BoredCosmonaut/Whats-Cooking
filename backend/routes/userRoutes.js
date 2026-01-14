const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const rateLimiter = require('../middleware/rateLimiterMiddleware');
const {upload} = require('../middleware/dynamicUploadMiddleware')
const {body} = require('express-validator')

const registerValidation = [
    body('username')
        .trim()
        .notEmpty()
        .isLength({min:3,max:20}).withMessage('Username length must be between 3-20 characters')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username must only include numbers and letters')
        .escape(),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password required')
        .isLength({min:8}).withMessage('Password must be at least 8 chars')
        .matches(/^(?=.*[A-Z])(?=.*\d).*$/).withMessage('Password must contain at least one uppercase letter and one number')
]


router.post('/register', rateLimiter.registerUserLimiter,registerValidation,userController.registerUser);

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
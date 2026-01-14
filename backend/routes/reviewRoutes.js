const express = require('express');
const router = express.Router();
const {body} = require('express-validator')
const reviewController = require('../controllers/reviewControllers');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const rateLimiter = require('../middleware/rateLimiterMiddleware');
const dynamicUpload = require('../middleware/dynamicUploadMiddleware');

const reviewValidation = [
    body('comment')
        .trim()
        .notEmpty().withMessage('Comment cannot be empty')
        .isLength({min:10,max:500}).withMessage('Comment must be between 10-500 characters')
        .matches(/^[a-zA-Z0-9\s.,!?çğıöşüÇĞİÖŞÜ]+$/).withMessage('Comment includes restricted symbols. Use only letters and basic punctuation.')
        .escape(),
    body('rating')
        .notEmpty().withMessage('Rating cannot be empty')
        .isInt({min:1,max:5}).withMessage('Rating must be between 1 and 5')
]

const reportValidation = [
    body('reason')
        .trim()
        .notEmpty().withMessage('Report reason is required')
        .isLength({min:5,max:200}).withMessage('Reason is too short or too long')
        .escape()
]


router.post('/post/:id', authMiddleware, authorizeRoles('User','Admin'),dynamicUpload.upload.single('image'),reviewValidation,reviewController.createReview);

router.post('/report/:id', authMiddleware,authorizeRoles('User','Admin'),reportValidation,reviewController.reportReview);

router.post('/helpful/:id', authMiddleware,authorizeRoles('User','Admin'),reviewController.markReviewHelpful);

router.get('/reported', authMiddleware,authorizeRoles('Admin'),reviewController.getReportedReviews);

router.get('/:id',authMiddleware,authorizeRoles('User','Admin'),reviewController.getReviewsByRecipe);

router.delete('/remove/:id',authMiddleware,authorizeRoles('User','Admin'),reviewController.removeReview);

router.delete('/unmark/:id', authMiddleware,authorizeRoles('User','Admin'),reviewController.removeLikeFromReview);

module.exports = router;

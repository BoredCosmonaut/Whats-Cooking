const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewControllers');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const rateLimiter = require('../middleware/rateLimiterMiddleware');
const dynamicUpload = require('../middleware/dynamicUploadMiddleware');

router.post('/post/:id', authMiddleware, authorizeRoles('User','Admin'),dynamicUpload('reviews').single('image'),reviewController.createReview);

router.post('/report/:id', authMiddleware,authorizeRoles('User','Admin'),reviewController.reportReview);

router.post('/helpful/:id', authMiddleware,authorizeRoles('User','Admin'),reviewController.markReviewHelpful);

router.get('/reported', authMiddleware,authorizeRoles('Admin'),reviewController.getReportedReviews);

router.get('/:id',reviewController.getReviewsByRecipe);

router.delete('/remove/:id',authMiddleware,authorizeRoles('User','Admin'),reviewController.removeReview);

router.delete('/unmark/:id', authMiddleware,authorizeRoles('User','Admin'),reviewController.removeLikeFromReview);

module.exports = router;

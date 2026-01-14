const reviewModel = require('../model/reviewModel');
const userModel = require('../model/userModel'); 
const recipeModel = require('../model/recipeModel');
const { validationResult } = require('express-validator');
const {uploadToSupabase} = require(`../middleware/dynamicUploadMiddleware`)
async function createReview(req,res) {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({message: errors.array()[0].msg})
    }
    try {
        console.log('Review posted');
        const user_id = req.user.id;
        const {rating,comment} = req.body;
        const recipe_id = req.params.id;
        const review = await reviewModel.addReview(user_id,recipe_id,rating,comment);
        const recipe = await recipeModel.getRecipeInfoById(recipe_id);
        const recipe_author_id = recipe.submitted_by;

        if (req.file) {
            const { image_name, image_url } = await uploadToSupabase(req.file, 'reviews');

            await reviewModel.addReviewImage(review.review_id, image_name, image_url);
        }

        if(rating >= 3) {
            const points = 5;
            await userModel.updatePoints(recipe_author_id,'Recived Positive Review',points);
        } else if(rating < 3) {
            const points = -5;
            await userModel.updatePoints(recipe_author_id,'Recived Negative Review',points);
        };

        res.status(201).json({message:'Review added!',review});
    } catch (error) {
        console.error('Error while adding review:',error);
        res.status(500).json({message:'Failed to add review'});
    }
};


//ADD USER ID AND CHECK İF REVİEW İS LİKED
async function getReviewsByRecipe(req,res) {
    try {
        const recipe_id = parseInt(req.params.id);
        const user_id = req.user.id;
        if(!recipe_id) {
            return res.status(400).json({message:'Recipe id is empty'})
        };

        const reviews = await reviewModel.getReviewsByRecipe(recipe_id,user_id);

        if(!reviews || reviews.length === 0) return res.status(200).json({message:'No reviews fpr this recipe'});
        
        res.status(200).json({message:'Reviews for the recipe fetched', reviews:reviews});

    } catch (error) {
        console.error('Error while getting reviews:',error);
        res.status(500).json({message:'Couldnt fetch reviews for this recipe'});
    }
};

async function removeReview(req,res) {
    try {
        const review_id = parseInt(req.params.id);
        const isAdmin = req.user.role === 'Admin';
        const user_id = req.user.id

        const deleted = await reviewModel.removeReview(review_id,user_id,isAdmin);

        if(!deleted) return res.status(403).json({message:'You cant delete this review'});

        res.status(200).json({message:'Review deleted!'});

    } catch (error) {
        console.error('Error while deleting the review:',error);
    }
};

async function reportReview(req,res) {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({message: errors.array()[0].msg})
    }

    try {
        const review_id = req.params.id;
        const user_id = req.user.id;
        const {reason} = req.body;

        if(!reason) return res.status(400).json({message:'Reason is required to report a review'});

        const result = await reviewModel.reportReview(review_id,user_id,reason);

        const review = await reviewModel.getReviewById(review_id);

        if (result.length === 0) {
            return res.status(400).json({ message: 'You have already reported this review' });
        } else {
            res.status(201).json({message:'Review reported!'});
            if(review) {
                await userModel.updatePoints(review.user_id,'Review Reported', -5);
            };
        }

    } catch (error) {
        console.error('Error while reporting the review:', error);
        res.status(500).json({ message: "Couldn't report the review" });
    }
};

async function markReviewHelpful(req,res) {
    try {
        const review_id = req.params.id;
        const user_id = req.user.id;

        const result = await reviewModel.markReviewHelpful(review_id,user_id);

        if(result.length === 0) return res.status(400).json({message:'You already liked this review'});

        const helpful_count = await reviewModel.getHelpfulCount(review_id);

        res.status(200).json({message:'Marked review as helpful!', helpful_count});
    } catch (error) {
        console.error('Error while review helpful:',error);
        res.status(500).json({message:'Could not mark review as helpful'});
    }
};

async function getReportedReviews(req,res) {
    try {

        if(req.user.role !== 'Admin') {
            return res.status(403).json({message:'You dont have permissions to use this'});
        }

        const reports = await reviewModel.getReportedReviews();
        res.status(200).json({reports});
    } catch (error) {
        console.error('Error fetching reported reviews:',error);
        res.status(500).json({message:'Could not fetch reported reviews'});
    }
};

async function removeLikeFromReview(req,res) {
    try {
        const user_id = req.user.id;
        const review_id = req.params.id

        const result = await reviewModel.removeLikeFromReview(user_id,review_id);

        if(result.length === 0) {
            return res.status(400).json({message:'You have not marked this review helpful'});
        }

        const helpful_count = await reviewModel.getHelpfulCount(review_id);

        res.status(200).json({message:'Mark removed from the review', helpful_count : helpful_count});

    } catch (error) {
        console.error('Error unmarking the review:',error);
        res.status(500).json({message:'Couldnt remove like'});
    }
}

module.exports = {
    createReview,
    getReviewsByRecipe,
    removeReview,
    reportReview,
    getReportedReviews,
    markReviewHelpful,
    removeLikeFromReview
}

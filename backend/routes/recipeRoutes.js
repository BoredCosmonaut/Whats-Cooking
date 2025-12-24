const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const rateLimiter = require('../middleware/rateLimiterMiddleware');
const dynamicUpload = require('../middleware/dynamicUploadMiddleware')

router.post('/submit', authMiddleware, authorizeRoles('User','Admin'),dynamicUpload.upload.single('image'),rateLimiter.generalRateLimiter, recipeController.createRecipe);

router.post('/favorites/:id',authMiddleware,authorizeRoles('User','Admin'),recipeController.addFavoriteRecipe);

router.get('/info/:id',recipeController.getRecipeInfoById);

router.get('/recipes', recipeController.getAllRecipes);

router.get('/search', recipeController.searchRecipes);

router.get('/ingredients', recipeController.getAllIngredients);

router.get('/favorites', authMiddleware,authorizeRoles('Admin','User'), recipeController.getUserFavorites);

router.post('/findRecipe', recipeController.searchRecipeByIngredients);

router.get('/user/:id', recipeController.getUserRecipes);

router.put('/update-image/:id',authMiddleware,authorizeRoles('User','Admin'),dynamicUpload.upload.single('image'),rateLimiter.generalRateLimiter,recipeController.updateRecipeImage);

router.put('/update/:id', authMiddleware, authorizeRoles('User','Admin'), recipeController.updateRecipe);

router.delete('/favorites/:recipeId', authMiddleware, authorizeRoles('User','Admin'), recipeController.removeFavoriteRecipe);

router.delete('/:id', authMiddleware, authorizeRoles('User','Admin'), recipeController.deleteRecipe);


module.exports = router;
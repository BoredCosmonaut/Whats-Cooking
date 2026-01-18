const express = require('express');
const router = express.Router();
const {body,param, query} = require('express-validator')
const recipeController = require('../controllers/recipeController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const rateLimiter = require('../middleware/rateLimiterMiddleware');
const dynamicUpload = require('../middleware/dynamicUploadMiddleware')


const recipeValidations = {
    saveRecipe: [
        body('title')
            .trim()
            .notEmpty().withMessage('Title is required')
            .isLength({min:5, max: 25 }).withMessage('Title must be 5-25 chars long')
            .matches(/^[a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\s\.,!?'?\-]+$/)
            .withMessage('Title contains invalid characters'),

        body('description')
            .trim()
            .notEmpty().withMessage('Description is required')
            .isLength({ max: 500 }).withMessage('Description too long')
            .matches(/^[a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\s\.,!?'?()\-:;]+$/)
            .withMessage('Description contains invalid characters'),

        body('category')
            .trim()
            .notEmpty().withMessage('Please select a category')
            .isLength({ min: 3, max: 25 }).withMessage('Category name length issue')
            .matches(/^[a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\s\-]+$/)
            .withMessage('Category contains invalid characters'),
        body('cooking_time')
            .trim()
            .notEmpty().withMessage('Cooking time is required')
            .isInt().withMessage('Cooking time must be a number'),
        body('difficulty')
            .isIn(['Easy', 'Medium', 'Hard']).withMessage('Invalid difficulty level'),
        body('ingredients').custom((value) => {
            const parsed = typeof value === 'string' ? JSON.parse(value) : value;
            if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Add at least one ingredient');
            
            const nameRegex = /^[a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\s\-\,\.\(\)\/]+$/;
            
            parsed.forEach(ing => {
                if (!ing.name || !nameRegex.test(ing.name)) {
                    throw new Error(`Invalid characters in ingredient: ${ing.name || 'empty'}`);
                }
                if (ing.quantity && !nameRegex.test(ing.quantity)) {
                    throw new Error(`Invalid characters in quantity for ${ing.name}`);
                }
            });
            return true;
        }),
        body('steps').custom((value) => {
            const parsed = typeof value === 'string' ? JSON.parse(value) : value;
            if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Add at least one step');
            
            const stepRegex = /^[a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\s\-\,\.\!\'\?\(\)\:\;\n]+$/;

            parsed.forEach((step, index) => {
                const text = typeof step === 'object' ? step.description : step;
                if (!text || !stepRegex.test(text)) {
                    throw new Error(`Invalid characters in Step ${index + 1}`);
                }
            });
            return true;
        }),
    ],
    idParam: [
        param('id').optional().isInt().withMessage('Invalid ID'),
        param('recipeId').optional().isInt().withMessage('Invalid Recipe ID')
    ],
    search: [
        query('q').optional().trim().escape()
    ]
};


router.post('/submit', authMiddleware, authorizeRoles('User','Admin'),dynamicUpload.upload.single('image'),rateLimiter.generalRateLimiter,recipeValidations.saveRecipe, recipeController.createRecipe);

router.post('/favorites/:id',authMiddleware,authorizeRoles('User','Admin'),recipeValidations.idParam,recipeController.addFavoriteRecipe);

router.get('/info/:id',recipeValidations.idParam,recipeController.getRecipeInfoById);

router.get('/recipes', recipeController.getAllRecipes);

router.get('/search',recipeValidations.search, recipeController.searchRecipes);

router.get('/ingredients', recipeController.getAllIngredients);

router.get('/favorites', authMiddleware,authorizeRoles('Admin','User'), recipeController.getUserFavorites);

router.post('/findRecipe', recipeController.searchRecipeByIngredients);

router.get('/user/:id', recipeController.getUserRecipes);

router.put('/update-image/:id',authMiddleware,authorizeRoles('User','Admin'),dynamicUpload.upload.single('image'),rateLimiter.generalRateLimiter,recipeController.updateRecipeImage);

router.put('/update/:id', authMiddleware, authorizeRoles('User','Admin'),recipeValidations.idParam,recipeValidations.saveRecipe, recipeController.updateRecipe);

router.delete('/favorites/:recipeId', authMiddleware, authorizeRoles('User','Admin'),recipeValidations.idParam, recipeController.removeFavoriteRecipe);

router.delete('/:id', authMiddleware, authorizeRoles('User','Admin'),recipeValidations.idParam, recipeController.deleteRecipe);


module.exports = router;
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;
const recipeModel = require('../model/recipeModel');
const { error } = require('console');

async function createRecipe(req, res) {
  try {
    console.log("createRecipe called once for recipe:", req.body.title);
    let { title, description, category, cooking_time, difficulty, ingredients, steps } = req.body;
    const submitted_by = req.user.id;

    if (!submitted_by) {
      return res.status(400).json({ message: "You must have an account to submit a recipe" });
    }

    if (typeof ingredients === "string") {
      ingredients = JSON.parse(ingredients);
    }
    if (typeof steps === "string") {
      steps = JSON.parse(steps);
    }

    const newRecipe = await recipeModel.createRecipe(
      title,
      description,
      submitted_by,
      category,
      cooking_time,
      difficulty
    );

    const recipe_id = newRecipe.recipe_id;
    let recipe_image;

    if (req.file) {
      const image_name = req.file.filename;
      const image_url = `/images/recipes/${image_name}`;
      recipe_image = await recipeModel.addRecipeImage(recipe_id, image_url, image_name);
    }

    if (ingredients && ingredients.length > 0) {
      for (const ing of ingredients) {
        let ingredient = await recipeModel.getIngredientByName(ing.name);
        if (!ingredient) {
          ingredient = await recipeModel.addIngredient(ing.name);
        }
        await recipeModel.addRecipeIngredient(recipe_id, ingredient.ingredient_id, ing.quantity || null);
      }
    }

    if (Array.isArray(steps) && steps.length > 0) {
      steps = steps.flat();
      console.log("Steps received:", steps);
      for (let i = 0; i < steps.length; i++) {
        await recipeModel.addRecipeStep(recipe_id, i + 1, steps[i]);
      }
    }

    res.status(201).json({
      message: "Recipe created successfully",
      recipe: newRecipe,
      image: recipe_image,
    });
  } catch (error) {
    console.error("Error creating recipe:", error);
    res.status(500).json({ message: "Recipe creation failed" });
  }
}


async function getRecipeInfoById(req,res) {
  try {
    const recipe_id = req.params.id;
    const recipe = await recipeModel.getRecipeInfoById(recipe_id);
    res.status(201).json({message:'Recipe info fetched',recipe:recipe});
  } catch (error) {
    console.error('Error while getting recipe info:',error);
    res.json(500).json('Cant get recipe info');
  }
};

async function getAllRecipes(req,res) {
  try {
    const recipes = await recipeModel.getAllRecipes();
    res.status(201).json({Message: 'Recipes fetched', recipes:recipes});
  } catch (error) {
    console.error('Error while getting the recipes:',error);
    res.status(500).json('Cant get recipe info');
  }
};

async function updateRecipe(req, res) {
  try {
    const recipe_id = req.params.id;

    const recipe = await recipeModel.getRecipeInfoById(recipe_id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    if (recipe.submitted_by !== req.user.id && req.user.role !== "Admin") {
      return res.status(403).json({ message: "You can only update your own recipes" });
    }

    let { title, description, category, cooking_time, difficulty, ingredients, steps } = req.body;

    if (typeof ingredients === "string") {
      ingredients = JSON.parse(ingredients);
    }
    if (typeof steps === "string") {
      steps = JSON.parse(steps);
    }

    const updatedRecipe = await recipeModel.updateRecipe(
      recipe_id,
      title,
      description,
      category,
      cooking_time,
      difficulty
    );

    if (ingredients && ingredients.length > 0) {
      await recipeModel.replaceRecipeIngredients(recipe_id, ingredients);
    }

    if (steps && steps.length > 0) {
      await recipeModel.replaceRecipeSteps(recipe_id, steps);
    }

    res.status(200).json({ message: "Recipe updated!", recipe: updatedRecipe });
  } catch (error) {
    console.error("Error updating recipe:", error);
    res.status(500).json({ message: "Failed to update the recipe" });
  }
}


async function updateRecipeImage(req,res) {
  try {
    const recipe_id = req.params.id;

    if(!req.file) {
      return res.status(400).json({message:'No image uploaded'});
    }
    
    const recipe = await recipeModel.getRecipeInfoById(recipe_id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    
    if (recipe.submitted_by !== req.user.id && req.user.role !== "Admin") {
      return res.status(403).json({ message: "You can only update your own recipes" });
    }

    const image_name = req.file.filename;
    const image_url = `/images/recipes/${image_name}`;

    const updated_image = await recipeModel.updateRecipeImage(recipe_id,image_url,image_name);
    
    if (recipe.image_name) {
      console.log(recipe.image_name)
      const filename = path.basename(recipe.image_name);

      const oldImagePath = path.join(__dirname, '..', '..', 'images', 'recipes', filename);

      fs.unlink(oldImagePath, (err) => {
        if (err) console.error('Failed to delete old image:', err);
      });
    }

    res.status(200).json({message:'Recipe image updated', image:updated_image});

  } catch (error) {
    console.error('Error while updating recipe image:',error);
    res.status(500).json({message:'failed to update recipe image'});
  }
};

async function deleteRecipe(req,res) {
  try {
    const id = req.params.id;
    const recipe = await recipeModel.getRecipeInfoById(id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    
    if (recipe.submitted_by !== req.user.id && req.user.role !== "Admin") {
      return res.status(403).json({ message: "You can only update your own recipes" });
    };

    recipeModel.deleteRecipe(id);

    if (recipe.image_name) {
      console.log(recipe.image_name)
      const filename = path.basename(recipe.image_name);

      const oldImagePath = path.join(__dirname, '..', '..', 'images', 'recipes', filename);

      fs.unlink(oldImagePath, (err) => {
        if (err) console.error('Failed to delete old image:', err);
      });
    };

    res.status(200).json({message:"Recipe deleted"});

  } catch (error) {
    console.error('Error while deleting the recipe:',error);
    res.status(500).json({message:'Failed to delete recipe'})
  }
};

async function searchRecipes(req, res) {
  try {
    const { name } = req.query; // ✅ get the actual string "pasta"
    
    if (!name) {
      return res.status(400).json({ message: "Query ?name= is missing" });
    }

    const recipes = await recipeModel.searchRecipes(name);

    res.status(200).json({
      message: `Recipes found with the name '${name}'`,
      recipes,
    });
  } catch (error) {
    console.error("Error while getting recipes:", error);
    res.status(500).json({ message: "Couldn't search the recipes" });
  }
};


async function addFavoriteRecipe(req,res) {
  try {
    const user_id = req.user.id;
    const {recipe_id} = req.body;

    const favorites = await recipeModel.addFavoriteRecipe(user_id,recipe_id);
    if(!favorites) return res.json(200).json({message:'Already in favorites'});

    res.status(200).json({message:'Recipe added to favorites'});
  } catch (error) {
    console.error('Error while adding fav recipe:',error);
    res.status(500).json({message:'Failed to add the recipe to the favorites'});
  }
};

async function removeFavoriteRecipe(req,res) {
  try {
    console.log('Params:', req.params);
    const user_id = req.user.id;
    const recipe_id = req.params.recipeId;


    await recipeModel.removeFavoriteRecipe(user_id,recipe_id);

    res.status(200).json({message:'Recipe removed from favorites'});
  } catch (error) {
    console.error('Error while removing favorites:',error);
    res.status(500).json({message:'Failed to remove favorite recipe'});
  }
};

async function getUserFavorites(req,res) {
  try {
    const user_id = req.user.id;
    const favorites = await recipeModel.getUserFavorites(user_id);

    res.status(200).json({message:'Favorites fetched', favorites:favorites});

  } catch (error) {
    console.error('Error while fetching favorites:', error);
    res.status(500).json({message:'Failed to get favorites'});
  }
};

async function searchRecipeByIngredients(req,res) {
  try {
    const {ingredients} = req.body;
  
    if(!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) return res.status(400).json({message:'Please send an array'});
  
    const recipes = await recipeModel.searchRecipeByIngredients(ingredients);

    if(recipes.length === 0) res.status(200).json({message:'Failed to find a suitable recipe'});
    else  res.status(200).json({message:'Recipes you can cook', recipes:recipes});
  
  } catch (error) {
    console.error('Error while getting recipes:',error);
    res.status(500).json({message:'Error while searching the recipes'});
  }
};

module.exports = {
    createRecipe,
    getRecipeInfoById,
    getAllRecipes,
    updateRecipe,
    updateRecipeImage,
    deleteRecipe,
    searchRecipes,
    addFavoriteRecipe,
    removeFavoriteRecipe,
    getUserFavorites,
    searchRecipeByIngredients
}
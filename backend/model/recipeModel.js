const db = require('../config/db');

async function createRecipe(title, description, submitted_by, category, cooking_time, difficulty) {
  try {
    const result = await db.query(
      `
      INSERT INTO recipes (title, description, submitted_by, category, cooking_time, difficulty)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
      `,
      [title, description, submitted_by, category, cooking_time, difficulty]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error while creating recipe:', error);
  }
}


async function addRecipeImage(recipeId,image_url,image_name) {
    try {
        const result = await db.query(`
            INSERT INTO recipe_gallery (recipe_id, image_url, image_name)
            VALUES ($1, $2, $3)
            RETURNING *`,[recipeId,image_url,image_name]);
        return result.rows[0];
    } catch (error) {
        console.error('Error while adding an image:',error);
    }
};

async function getIngredientByName(name) {
    try {
        const result = await db.query(`SELECT * FROM  ingredients WHERE ingredient_name = $1`,[name]);
        return result.rows[0]
    } catch (error) {
        console.error('Error while getting ingredient names:',error);
    }
};

async function addIngredient(name) {
    try {
        const result = await db.query(`INSERT INTO ingredients (ingredient_name) VALUES ($1) RETURNING *`,[name]);
        return result.rows[0];
    } catch (error) {
        console.error('Error while adding ingredient:', error);
    }   
};

async function addRecipeIngredient(recipe_id,ingredient_id,quantity) {
    try {
        const result = await db.query(`
                                    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
                                    VALUES ($1, $2, $3) RETURNING *`
                                    ,[recipe_id,ingredient_id,quantity]);
        return result.rows[0];
    } catch (error) {
        console.error('Error while adding ingredient to recipe:', error);
    }
};

async function addRecipeStep(recipe_id, step_order, instruction) {
  try {
    const result = await db.query(
      `
      INSERT INTO recipe_steps (recipe_id, step_number, instruction)
      VALUES ($1, $2, $3)
      ON CONFLICT (recipe_id, step_number) 
      DO UPDATE SET instruction = EXCLUDED.instruction
      RETURNING *;
      `,
      [recipe_id, step_order, instruction]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error while adding steps:", error);
  }
}


async function getRecipeInfoById(id) {
    try {
        const result = await db.query(`
                            SELECT 
                                r.*,
                                u.username AS submitted_by_username,
                                r.submitted_by,
                                ri.image_name,
                                (
                                SELECT json_agg(jsonb_build_object(
                                    'ingredient_id', i.ingredient_id,
                                    'name', i.ingredient_name,
                                    'quantity', riq.quantity
                                ))
                                FROM recipe_ingredients riq
                                JOIN ingredients i ON riq.ingredient_id = i.ingredient_id
                                WHERE riq.recipe_id = r.recipe_id
                                ) AS ingredients,
                                (
                                SELECT json_agg(jsonb_build_object(
                                    'step_number', rs.step_number,
                                    'description', rs.instruction
                                ) ORDER BY rs.step_number)
                                FROM recipe_steps rs
                                WHERE rs.recipe_id = r.recipe_id
                                ) AS steps
                            FROM recipes r
                            LEFT JOIN users u ON r.submitted_by = u.user_id
                            LEFT JOIN recipe_gallery ri ON r.recipe_id = ri.recipe_id
                            WHERE r.recipe_id = $1;`,[id]);
        return result.rows[0];
    } catch (error) {
        console.error('Error while getting recipe:',error);
    }
};

async function getAllRecipes() {
  try {
    const result = await db.query(`
      SELECT 
        r.*,
        u.username AS submitted_by_username,
        ri.image_name,
        json_agg(DISTINCT jsonb_build_object(
          'ingredient_id', i.ingredient_id,
          'name', i.ingredient_name,
          'quantity', riq.quantity
        )) AS ingredients,
        (
          SELECT json_agg(jsonb_build_object(
              'step_number', rs.step_number,
              'description', rs.instruction
            ) ORDER BY rs.step_number)
          FROM recipe_steps rs
          WHERE rs.recipe_id = r.recipe_id
        ) AS steps
      FROM recipes r
      LEFT JOIN users u ON r.submitted_by = u.user_id
      LEFT JOIN recipe_gallery ri ON r.recipe_id = ri.recipe_id
      LEFT JOIN recipe_ingredients riq ON r.recipe_id = riq.recipe_id
      LEFT JOIN ingredients i ON riq.ingredient_id = i.ingredient_id
      GROUP BY r.recipe_id, r.title, r.description, r.submitted_by, u.username, ri.image_name
      ORDER BY r.recipe_id DESC;
    `);

    return result.rows;
  } catch (error) {
    console.error('Error while getting the recipes:', error);
  }
};

async function updateRecipe(recipe_id, title, description, category, cooking_time, difficulty) {
  try {
    const result = await db.query(
      `
      UPDATE recipes 
      SET title = $1, description = $2, category = $3, cooking_time = $4, difficulty = $5
      WHERE recipe_id = $6
      RETURNING *;
      `,
      [title, description, category, cooking_time, difficulty, recipe_id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error while updating recipe info:', error);
  }
};


async function replaceRecipeIngredients(recipe_id,ingredients) {
    try {
        await db.query(`DELETE FROM recipe_ingredients WHERE recipe_id =$1`, [recipe_id]);

        for(const ing of ingredients) {
            let ingredient = await db.query(`SELECT * FROM ingredients WHERE ingredient_name = $1`
            ,[ing.name]);
            
            if(ingredient.rows.length === 0) {
                ingredient = await db.query(`INSERT INTO ingredients (ingredient_name) VALUES ($1) RETURNING *`
                ,[ing.name]);
            };

            await db.query(`
                INSERT INTO recipe_ingredients (recipe_id,ingredient_id,quantity)
                VALUES ($1,$2,$3)`,
                [recipe_id,ingredient.rows[0].ingredient_id,ing.quantity]);
        };

    } catch (error) {
        console.error('Error while updating ingredients:',error);
    }
};

async function replaceRecipeSteps(recipe_id,steps) {
    try {
        await db.query(`DELETE FROM recipe_steps WHERE recipe_id = $1`, [recipe_id]);

        for(let i =0; i< steps.length; i++) {
            await db.query(`
                INSERT INTO recipe_steps (recipe_id,step_number,instruction) VALUES ($1,$2,$3)`,
                [recipe_id,i+1,steps[i]]
            );
        };
    } catch (error) {
        console.error('Error while updating steps:',error);
    }
};

async function updateRecipeImage(recipe_id,image_url,image_name) {
    try {
        const result = await db.query(`
            UPDATE recipe_gallery
            SET image_url = $1, image_name = $2 
            WHERE recipe_id = $3 RETURNING *`,
            [image_url,image_name,recipe_id]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error while updating recipe image:',error);
    }
};

async function deleteRecipe(recipe_id) {
    try {
        await db.query('DELETE FROM recipe_gallery WHERE recipe_id = $1', [recipe_id]);
        await db.query('DELETE FROM recipes WHERE recipe_id = $1', [recipe_id]);
    } catch (error) {
        console.error('Error while deleting the recipe:',error)
    }
};

async function searchRecipes(name) {
    try {
        const result = await db.query(`
                                    SELECT *,u.username AS submitted_by_username FROM recipes r  
                                    LEFT JOIN users u ON r.submitted_by = u.user_id
                                    LEFT JOIN recipe_gallery rg ON r.recipe_id = rg.recipe_id 
                                    WHERE LOWER(title) LIKE LOWER($1)`, [`%${name}%`]);
        return result.rows;
    } catch (error) {
        console.error('Error while searching for the recipe:',error)
    }
};

async function addFavoriteRecipe(user_id,recipe_id) {
    try {
        const result = await db.query(`
                        INSERT INTO favorites (user_id,recipe_id) 
                        VALUES ($1,$2) 
                        ON CONFLICT (user_id,recipe_id) 
                        DO NOTHING RETURNING *`,[user_id,recipe_id]);
        return result.rows[0];
    } catch (error) {
        console.error('Error while adding it to favorites:',error)
    }
};

async function removeFavoriteRecipe(user_id,recipe_id) {
    try {
        await db.query(`DELETE FROM favorites WHERE user_id = $1 AND recipe_id =$2`, [user_id,recipe_id]);
        return true;
    } catch (error) {
        console.error('Error while removing favorites:',error);
    }
};

async function getUserFavorites(user_id) {
    try {
        const result = await db.query(`
                    SELECT r.recipe_id, r.title, r.description, rg.image_name
                    FROM favorites f
                    JOIN recipes r ON f.recipe_id = r.recipe_id
                    LEFT JOIN recipe_gallery rg ON r.recipe_id = rg.recipe_id
                    WHERE f.user_id = $1`,[user_id]);
        return result.rows;
    } catch (error) {
        console.error('Error while fetching recipes:',error);
    }
};

async function searchRecipeByIngredients(ingredients) {
    try {
        const results = await db.query(`
                    SELECT r.recipe_id, r.title, r.description,r.time,r.diffucilty rg.image_url
                    FROM recipes r
                    JOIN recipe_ingredients ri ON r.recipe_id = ri.recipe_id
                    JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
                    LEFT JOIN recipe_gallery rg ON r.recipe_id = rg.recipe_id
                    GROUP BY r.recipe_id, rg.image_url
                    HAVING EVERY(LOWER(i.ingredient_name) = ANY($1));
                    `,[ingredients.map((n) => n.toLowerCase())]);
        return results.rows;
    } catch (error) {
        console.error('Error while finding a recipe:',error)      
    }
};



module.exports = {
    createRecipe,
    addRecipeImage,
    getIngredientByName,
    addIngredient,
    addRecipeImage,
    addRecipeStep,
    addRecipeIngredient,
    getAllRecipes,
    getRecipeInfoById,
    replaceRecipeIngredients,
    replaceRecipeSteps,
    updateRecipe,
    updateRecipeImage,
    deleteRecipe,
    searchRecipes,
    addFavoriteRecipe,
    removeFavoriteRecipe,
    getUserFavorites,
    searchRecipeByIngredients
};
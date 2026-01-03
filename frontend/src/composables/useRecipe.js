import {ref} from 'vue';
import { getAllRecipes as allRecipeApi } from '@/services/recipeService';
import { getUserRecipes as userRecipesApi } from '@/services/recipeService';
import { getRecipeById as recipeInfoApi } from '@/services/recipeService';
import { submitRecipe as submitRecipeApi } from '@/services/recipeService';
import { deleteRecipe as deleteRecipeApi } from '@/services/recipeService';
import { addFavoriteRecipe as favoriteRecipeApi } from '@/services/recipeService';
import { removeFavoriteRecipe as removeFavoriteApi } from '@/services/recipeService';
import { getUserFavorites as getFavoritesApi } from '@/services/recipeService';
import { updateRecipe as updateRecipeApi } from '@/services/recipeService';
import { updateRecipeImage as updateRecipeImageApi } from '@/services/recipeService';
import {findRecipeViaIngs as searchRecipeByIngredientsApi} from '@/services/recipeService';
import { getAllIngredients as getAllIngredientsApi } from '@/services/recipeService';
export function useRecipe() {
    const recipes = ref([]);
    const isLoading = ref(false);
    const error = ref(null);
    const recipe = ref([])
    async function getAllRecipes() {

        try {
            const data = await allRecipeApi();
            recipes.value = data.recipes
            return data
        } catch (error) {
            error.value = error.response?.data?.message || 'Failed to fetch recipe info'
        } finally {
            isLoading.value = false;
        }

    }

    async function getUserRecipes(user_id) {
        isLoading.value = true;
        try {
            const data = await userRecipesApi(user_id);
            recipes.value = data.recipes;
            return data
        } catch (error) {
            error.value = error.response?.data?.message || 'Failed to get user recipes';
        } finally {
            isLoading.value = false;
        }
    }

    async function getRecipeById(recipe_id) {
        isLoading.value = true;
        try {
            const data = await recipeInfoApi(recipe_id);
            recipe.value = data.recipe;
            console.log(recipe.value);
            return data;
        } catch (error) {
            error.value = error.response?.data?.message || 'Failed to get recipe';
        } finally {
            isLoading.value = false;
        }
    }

    async function submitRecipe(formData) {
        isLoading.value = true;
        error.value = null;
        try {
            const data = await submitRecipeApi(formData);
            return data;
        } catch(error) {
            error.value = error.response?.data?.message || 'Failed to submit recipe';
        } finally {
            isLoading.value = false;
        }
    }

    async function deleteRecipe(recipe_id) {
        isLoading.value = true;
        error.value = null;
        try {
            const data = await deleteRecipeApi(recipe_id);
            return data;
        } catch(error) {
            error.value = error.response?.data?.message || 'Failed to delete recipe';
        } finally {
            isLoading.value = false;
        }
    }

    async function addFavoriteRecipe(recipe_id) {
        isLoading.value = true;
        error.value = null;
        try {
            const data = await favoriteRecipeApi(recipe_id)
            return data;
        } catch (error) {
            error.value = error.response?.data?.message || 'Failed to add recipe to favs';
        } finally {
            isLoading.value = false
        }
    }

    async function removeFavoriteRecipe(recipe_id) {
        isLoading.value = true;
        error.value = null;
        try {
            const data = await removeFavoriteApi(recipe_id)
            return data
        } catch (error) {
            error.value = error.response?.data?.message || 'Failed to remove recipe to favs';
        } finally {
            isLoading.value = false
        }
    }

    async function getFavorites() {
        error.value = null;
        try {
            const data = await getFavoritesApi()
            return Array.isArray(data) ? data : data?.favorites || [];
        } catch (error) {
            error.value = error.response?.data?.message || 'Failed to get favs';
        }
    }

    async function updateRecipe(recipe_id,data) {
        error.value = null
        try {
            isLoading.value = true
            const response = await updateRecipeApi(recipe_id,data)
            return response
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to update the recipe ';
        } finally {
            isLoading.value = false
        }
    } 

    async function updateRecipeImage(recipe_id,data) {
        error.value = null
        try {
            const response = await updateRecipeImageApi(recipe_id,data)
            return response
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to update the recipe image';
        }
    }

    async function searchRecipesApi(data) {
        error.value = null;
        isLoading.value = true; 
        try {
            const response = await searchRecipeByIngredientsApi(data); 
            return response;
        } catch (err) {
            console.error(err);
            error.value = err.response?.data?.message || 'Failed to find any recipe';
            return null;
        } finally {
            isLoading.value = false;
        }
    }





    async function getAllIngredients() {
        try {
            const response = await getAllIngredientsApi();
            return response
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to get ings';
        }
    }

    return {recipe,recipes,isLoading,error,getAllRecipes,getUserRecipes,getRecipeById,submitRecipe,deleteRecipe,addFavoriteRecipe,removeFavoriteRecipe,getFavorites,updateRecipe,updateRecipeImage,searchRecipesApi,getAllIngredients}

}
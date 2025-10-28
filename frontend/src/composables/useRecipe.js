import {ref} from 'vue';
import { getAllRecipes as allRecipeApi } from '@/services/recipeService';
import { getUserRecipes as userRecipesApi } from '@/services/recipeService';
import { getRecipeById as recipeInfoApi } from '@/services/recipeService';
import { submitRecipe as submitRecipeApi } from '@/services/recipeService';
import { deleteRecipe as deleteRecipeApi } from '@/services/recipeService';
import { addFavoriteRecipe as favoriteRecipeApi } from '@/services/recipeService';
import { removeFavoriteRecipe as removeFavoriteApi } from '@/services/recipeService';
import { getUserFavorites as getFavoritesApi } from '@/services/recipeService';
export function useRecipe() {
    const recipes = ref([]);
    const isLoading = ref(false);
    const error = ref(null);
    const recipe = ref([])
    async function getAllRecipes() {
        isLoading.value = true;

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
        isLoading.value = false;
        error.value = null;
        try {
            const data = await submitRecipeApi(formData);
            return data;
        } catch(error) {
            error.value = error.response?.data?.message || 'Failed to submit recipe';
        } finally {
            isLoading.value = true;
        }
    }

    async function deleteRecipe(recipe_id) {
        isLoading.value = false;
        error.value = null;
        try {
            const data = await deleteRecipeApi(recipe_id);
            return data;
        } catch(error) {
            error.value = error.response?.data?.message || 'Failed to delete recipe';
        } finally {
            isLoading.value = true;
        }
    }

    async function addFavoriteRecipe(recipe_id) {
        error.value = null;
        try {
            const data = await favoriteRecipeApi(recipe_id)
            return data;
        } catch (error) {
            error.value = error.response?.data?.message || 'Failed to add recipe to favs';
        }
    }

    async function removeFavoriteRecipe(recipe_id) {
        error.value = null;
        try {
            const data = await removeFavoriteApi(recipe_id)
            return data
        } catch (error) {
            error.value = error.response?.data?.message || 'Failed to remove recipe to favs';
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

    return {recipe,recipes,isLoading,error,getAllRecipes,getUserRecipes,getRecipeById,submitRecipe,deleteRecipe,addFavoriteRecipe,removeFavoriteRecipe,getFavorites}

}
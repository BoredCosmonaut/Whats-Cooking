import {ref} from 'vue';
import { getAllRecipes as allRecipeApi } from '@/services/recipeService';
import { getUserRecipes as userRecipesApi } from '@/services/recipeService';
export function useRecipe() {
    const recipes = ref([]);
    const isLoading = ref(true);
    const error = ref(null);

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

    return {recipes,isLoading,error,getAllRecipes,getUserRecipes}

}
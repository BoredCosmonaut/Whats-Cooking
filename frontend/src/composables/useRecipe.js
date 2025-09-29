import {ref} from 'vue';
import { getAllRecipes as allRecipeApi } from '@/services/recipeService';

export function useRecipe() {
    const recipes = ref([]);
    const isLoading = ref(true);
    const error = ref(null);

    async function getAllRecipes() {
        isLoading.value = true;

        try {
            const data = await allRecipeApi();
            recipes.value = data.recipes
            console.log(recipes.value);
            return data
        } catch (error) {
            error.value = error.response?.data?.message || 'Failed to fetch recipe info'
        } finally {
            isLoading.value = false;
        }

    }

    return {recipes,isLoading,error,getAllRecipes}

}
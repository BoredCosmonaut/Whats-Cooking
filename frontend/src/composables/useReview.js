import { ref } from "vue";
import { getReviewsForRecipe as reviewInfoApi } from "@/services/reviewService";

export function useReview(){
    const reviews = ref([]);
    const isLoading = ref(true);
    const error = ref(null);

    async function getReviewsForRecipe(recipe_id) {
        isLoading.value = true;
        try {
            const response = await reviewInfoApi(recipe_id);
            const data = response.data
            console.log("Reviews API response:", data);
            reviews.value = data.reviews;
            return data;
        } catch (error) {
            error.value = error.response?.data?.message || 'Failed to fetch review info';
        } finally {
            isLoading.value = false
        }
    }

    return {reviews,isLoading,error,getReviewsForRecipe};
}
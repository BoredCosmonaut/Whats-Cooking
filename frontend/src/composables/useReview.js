import { ref } from "vue";
import { getReviewsForRecipe as reviewInfoApi } from "@/services/reviewService";
import { markReviewHelpful as markReviewApi } from "@/services/reviewService";
import { unmarkReviewHelpful as removeLikeApi } from "@/services/reviewService";
import { removeReview as removeReviewApi } from "@/services/reviewService";
import { postReview as postReviewApi } from "@/services/reviewService";
export function useReview(){
    const reviews = ref([]);
    const isLoading = ref(true);
    const error = ref(null);

    async function getReviewsForRecipe(recipe_id) {
        isLoading.value = true;
        try {
            const response = await reviewInfoApi(recipe_id);
            const data = response.data
            reviews.value = data.reviews;
            return data;
        } catch (error) {
            error.value = error.response?.data?.message || 'Failed to fetch review info';
        } finally {
            isLoading.value = false
        }
    }

    async function markReviewHelpful(recipe_id) {
        isLoading.value = true
        try {
            const response = await markReviewApi(recipe_id)
            return response.data

        } catch (error) {
            error.value = error.response?.data?.message || 'Failed to mark review ';
        } finally {
            isLoading.value = false
        }
    }

    async function unmarkReviewHelpful(recipe_id) {
        isLoading.value = true
        try {
            const response = await removeLikeApi(recipe_id);
            return response.data
        } catch (error) {
            error.value = error.response?.data?.message || 'Failed to unmark review ';
        } finally {
            isLoading.value = false
        }
    }

    async function removeReview(review_id) {
        isLoading.value = true
        try {
            const response = await removeReviewApi(review_id);
            return response.data
        } catch (error) {
            error.value = error.response?.data?.message || 'Failed to remove review ';
        } finally {
            isLoading.value = false
        }
    }

    async function postReview(recipe_id,reviewData) {
        try {
            const formData = new FormData();
            formData.append('rating',reviewData.rating);
            formData.append('comment',reviewData.comment);
            formData.append('image',reviewData.image);

            const res = await postReviewApi(recipe_id,formData)

            return res;
        } catch (error) {
            console.error('Error posting review:', error);
        }
    }

    return {reviews,isLoading,error,getReviewsForRecipe,markReviewHelpful,unmarkReviewHelpful,removeReview,postReview};
}
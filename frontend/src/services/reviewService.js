import api from "./api";

export async function getReviewsForRecipe(recipe_id) {
    const result = await api.get(`/reviews/${recipe_id}`)
    return result
}
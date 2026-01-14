import api from "./api";

export async function getReviewsForRecipe(recipe_id) {
    const result = await api.get(`/reviews/${recipe_id}`)
    return result
}

export async function markReviewHelpful(recipe_id) {
    const result = await api.post(`/reviews/helpful/${recipe_id}`)
    return result
}

export async function unmarkReviewHelpful(recipe_id) {
    const result = await api.delete(`/reviews/unmark/${recipe_id}`)
    return result
}

export async function removeReview(review_id) {
    const result = await api.delete(`/reviews/remove/${review_id}`)
    return result
}

export async function postReview(recipe_id,formData) {
    try {
        const res = await api.post(`/reviews/post/${recipe_id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data
    } catch (err) {
        console.error('Error posting review:', err);
        throw err
    }
}

export async function reportReview(review_id, reason) {
  try {
    const token = localStorage.getItem('token');

    const res = await api.post(
      `/reviews/report/${review_id}`,
      { reason }, // send as an object
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return res.data;
  } catch (error) {
    console.error('Error reporting review:', error);
    throw error;
  }
}

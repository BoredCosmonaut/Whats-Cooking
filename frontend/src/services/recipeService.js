import api from "./api";

export async function getAllRecipes() {
    const result = await api.get(`/recipes/recipes`);
    return result.data;   
}

export async function getUserRecipes(user_id) {
    const result = await api.get(`/recipes/user/${user_id}`)
    return result.data
}

export async function getRecipeById(recipe_id) {
    const result = await api.get(`/recipes/info/${recipe_id}`)
    return result.data
}

export async function submitRecipe(formData) {
    const token = localStorage.getItem('token');
    const result = await api.post(`/recipes/submit`, formData, {
        headers:{
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
    });
    return result.data
}

export async function deleteRecipe(recipe_id) {
    const result = await api.delete(`/recipes/${recipe_id}`)
    return result.data;
}

export async function addFavoriteRecipe(recipe_id) {
    const result = await api.post(`/recipes/favorites/${recipe_id}`)
    return result.data;
}

export async function removeFavoriteRecipe(recipe_id) {
    const result = await api.delete(`/recipes/favorites/${recipe_id}`)
    return result.data
}

export async function getUserFavorites() {
    const result = await api.get('/recipes/favorites')
    console.log(result)
    return result.data
}
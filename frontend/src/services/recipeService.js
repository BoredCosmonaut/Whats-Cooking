import api from "./api";

export async function getAllRecipes() {
    const result = await api.get(`/recipes/recipes`);
    return result.data;   
}

export async function getUserRecipes(user_id) {
    const result = await api.get(`/recipes/user/${user_id}`)
    return result.data
}
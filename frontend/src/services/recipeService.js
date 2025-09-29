import api from "./api";

export async function getAllRecipes() {
    const result = await api.get(`/recipes/recipes`);
    return result.data;   
}
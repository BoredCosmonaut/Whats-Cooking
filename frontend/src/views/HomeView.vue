<template> 
    <div class="main">
        <div class="content">
            <h1 class="recipes">Recipes</h1>
            <p v-if="recipesLoading">Loading recipes...</p>
            <div v-if="recipes.length" class="recipe-cards">
                <RecipeCard 
                    v-for="recipe in recipes"
                    :key="recipe.recipe_id"
                    :recipe="recipe"
                />
            </div>
        </div>
        <div class="featured">

            <div class="top">
                <chefCard 
                    v-for="chef in chefs"
                    :key="chef.user_id"
                    :chef="chef"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
    import { onMounted } from 'vue';
    import { useRecipe } from '@/composables/useRecipe';
    import RecipeCard from '@/components/recipeCard.vue';
    import { useUser } from '@/composables/useUsers';
    import chefCard from '@/components/chefCard.vue';

    const {recipes,isLoading:recipesLoading,getAllRecipes} = useRecipe();
    const {chefs,fetchTopUsers} = useUser()
    onMounted( async () => {
        await getAllRecipes();
        await fetchTopUsers();
    })

</script>

<style scoped>
.content {
    display: flex;
    flex-direction: column;
 }
.recipe-cards {
    display: flex;
    flex-direction: row;
}
</style>
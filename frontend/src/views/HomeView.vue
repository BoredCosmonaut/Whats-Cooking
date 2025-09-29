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
    </div>
</template>

<script setup>
    import { onMounted } from 'vue';
    import { useRecipe } from '@/composables/useRecipe';
    import RecipeCard from '@/components/recipeCard.vue';

    const {recipes,isLoading:recipesLoading,getAllRecipes} = useRecipe();

    onMounted( async () => {
        await getAllRecipes();
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
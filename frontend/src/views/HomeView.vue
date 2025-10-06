<template> 
    <div class="main">
        <div class="content">
            <h1 class="recipes">Recipes</h1>
            <p v-if="recipesLoading">Loading recipes...</p>
            <div v-if="recipes.length" class="recipe-cards">
                <RouterLink
                    v-for="recipe in recipes"
                    :key="recipe.recipe_id"
                    :to="`/recipe/${recipe.recipe_id}`"
                    class="no-style-link recipe-cards "
                >
                    <RecipeCard :recipe="recipe"  class="content"/>
                </RouterLink>
            </div>
        </div>
        <div class="featured">
            <h2>Top</h2>
            <div class="top">
                <chefCard 
                    v-for="chef in chefs"
                    :key="chef.user_id"
                    :chef="chef"
                />
            </div>
            <h2>clowns</h2>
            <div class="bottom">
                <clownCard 
                    v-for="clown in clowns"
                    :key="clown.user_id"
                    :clown= "clown"
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
    import clownCard from '@/components/clownCard.vue';

    const {recipes,isLoading:recipesLoading,getAllRecipes} = useRecipe();
    const {chefs,clowns,fetchTopUsers,fetchBottomUsers} = useUser()
    onMounted( async () => {
        await getAllRecipes();
        await fetchTopUsers();
        await fetchBottomUsers();
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

.no-style-link {
    text-decoration: none;
}
</style>
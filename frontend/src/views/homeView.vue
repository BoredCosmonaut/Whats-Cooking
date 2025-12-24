<template> 
    <div class="main">
        <div class="content-column">
            <h1 class="page-title">Recipes</h1>
            <p v-if="recipesLoading" class="loading-message">Loading delicious recipes...</p>
            
            <div v-if="recipes.length" class="recipe-grid">
                <RouterLink
                    v-for="recipe in recipes"
                    :key="recipe.recipe_id"
                    :to="`/recipe/${recipe.recipe_id}`"
                    class="no-style-link recipe-card-link"
                >
                    <RecipeCard :recipe="recipe" />
                </RouterLink>
            </div>
        </div>
        
        <div class="featured-sidebar">
            <section class="top-chefs">
                <h2>Top Chefs 🧑‍🍳</h2>
                <div class="user-list">
                    <chefCard 
                        v-for="chef in chefs"
                        :key="chef.user_id"
                        :chef="chef"
                    />
                </div>
            </section>
            
            <section class="clown-users">
                <h2>Clowns 🤡</h2>
                <div class="user-list">
                    <clownCard 
                        v-for="clown in clowns"
                        :key="clown.user_id"
                        :clown= "clown"
                    />
                </div>
            </section>
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
/* Hex Codes Used:
#4CAF50 - Primary Green
#1B5E20 - Dark Green
#E8F5E9 - Very Light Green
#E0E0E0 - Light Gray
#FFFFFF - White
*/

.main {
    max-width: 1600px; 
    grid-template-columns: 5fr 1fr; 
    display: grid;
    gap: 3rem; 
    margin: 0 auto; 
    padding: 2rem 1.5rem;
    background-color: #FFFFFF;
    font-family: 'Arial', sans-serif;
}


.content-column {
    padding-right: 1.5rem;
}

.page-title, h2 {
    color: #1B5E20; 
    font-weight: 700;
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #E8F5E9; 
}

.loading-message {
    color: #4CAF50;
    font-style: italic;
    text-align: center;
}

.recipe-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); 
    gap: 2rem;
}

.recipe-card-link {
    text-decoration: none;
    color: inherit;
    transition: transform 0.2s;
    display: flex;
    height: 450px; 
}

.recipe-card-link:hover {
    transform: translateY(-3px);

}

.featured-sidebar {
    padding-left: 1.5rem;
}

.user-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
}

.top-chefs h2, .clown-users h2 {
    color: #4CAF50; 
}

@media (max-width: 900px) {
    .main {
        grid-template-columns: 1fr; 
        gap: 1.5rem;
    }
    
    .content-column {
        padding-right: 0;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid #E0E0E0; 
    }

    .featured-sidebar {
        padding-left: 0;
    }
    .recipe-card-link {
        height: auto; 
    }
}
</style>
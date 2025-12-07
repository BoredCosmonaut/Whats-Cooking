<script setup>
    import { onMounted } from 'vue';
    import { useRoute } from 'vue-router';
    import recipeCard from '@/components/recipeCard.vue';
    import { useRecipe } from '@/composables/useRecipe';
    import { useUser } from '@/composables/useUsers';
    const route = useRoute();
    const user_id = route.params.userId;
    
    const {recipes,isLoading:recipesLoading,getUserRecipes} = useRecipe()
    const {user,fetchUser} = useUser();

    onMounted(async() => {
        if(user_id){ 
            await fetchUser(user_id);
            console.log(user)
            await getUserRecipes(user_id);
        }
    })
    
</script>

<template>
  <div class="main-view">
    <div class="posts">
      <h2>Shared Recipes</h2>
      <div class="recipes">
        <p v-if="recipesLoading">Loading recipes...</p>
        <p v-else-if="recipes.length === 0">No recipes shared yet</p>

        <RouterLink
          v-for="recipe in recipes"
          :key="recipe.recipe_id"
          :to="`/recipe/${recipe.recipe_id}`"
          class="recipe-link"
        >
          <recipeCard :recipe="recipe" compact/>
        </RouterLink>
      </div>
    </div>
  </div>

</template>

<style scoped>

.main-view {
    display: flex;
    flex-direction: column;
    padding: 2.5rem 2rem;
    gap: 2.5rem;
    background: #FFFFFF; 
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
}


.posts {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid #E8F5E9;
}

.posts h2 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: #1B5E20; 
    border-bottom: 2px solid #4CAF50;
    padding-bottom: 0.5rem;
    display: inline-block;
    align-self: flex-start;
}

.recipes {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem; 
}


.recipe-link {
    text-decoration: none;
    color: inherit;
    display: block;
    transition: transform 0.2s ease, box-shadow 0.2s;
}

.recipe-link:hover {
    transform: translateY(-5px); 
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}

.recipe-link :deep(.recipe-card-root) {
    max-height: 250px; 
    overflow: hidden; 
}

.recipes p {
    grid-column: 1 / -1; 
    text-align: center;
    padding: 2rem;
    font-size: 1.1rem;
    color: #666;
    background: #E8F5E9; 
    border-radius: 4px;
}
</style>

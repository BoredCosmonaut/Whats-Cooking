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
          <recipeCard :recipe="recipe" />
        </RouterLink>
      </div>
    </div>
  </div>

</template>

<style scoped>

.main-view {
  display: flex;
  flex-direction: column;
  padding: 2rem;
  gap: 2rem;
  font-family: Arial, sans-serif;
  background: #f9f9f9;
  max-width: 1200px;
  margin: 0 auto;
}


.posts {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.posts h2 {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
}


.recipes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
}

.recipe-link {
  text-decoration: none;
  color: inherit;
  display: flex;
  justify-content: center;
  transition: transform 0.2s ease;
}

.recipe-link:hover {
  transform: translateY(-3px);
}

</style>

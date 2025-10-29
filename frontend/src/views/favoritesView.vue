<script setup>
    import {ref,onMounted} from 'vue'
    import { useRecipe } from '@/composables/useRecipe';
    import recipeCard from '@/components/recipeCard.vue';

    const {getFavorites,isLoading,error:apiError} = useRecipe()
    const favorites = ref([])

    onMounted(async () => {
    try {
        const data = await getFavorites()
        console.log('API data:', data)
        favorites.value = data || [] 
        console.log('Favorites ref:', favorites.value)
    } catch (err) {
        apiError.value = 'Failed to load favorites' 
    }
    })
</script>

<template>
  <main class="favorites-page">
    <h1>My Favorite Recipes</h1>

    <p v-if="isLoading">Loading favorites...</p>
    <p v-if="error">{{ error }}</p>

    <div v-if="!isLoading && favorites.length === 0">
      <p>You have no favorite recipes yet</p>
    </div>

    <div class="favorites-list">
    <RouterLink
        v-for="recipe in favorites"
        :key="recipe.recipe_id"
        :to="`/recipe/${recipe.recipe_id}`"
        class="favorite-link"
    >
        <recipeCard :recipe="recipe" />
    </RouterLink>
    </div>

  </main>
</template>

<style scoped>
.favorites-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.favorites-page h1 {
  font-size: 2.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
}

.favorites-page p {
  color: #666;
  font-size: 1.1rem;
}

.favorites-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 2rem;
  width: 100%;
  margin-top: 2rem;
}

.favorite-link {
  text-decoration: none;
  color: inherit;
  display: flex;
  justify-content: center;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.favorite-link:hover {
  transform: translateY(-3px);
}

</style>
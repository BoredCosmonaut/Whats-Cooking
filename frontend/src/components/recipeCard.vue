<template> 
    <main class="recipe-card">
        <img :src="`http://localhost:8080/images/recipes/${recipe.image_name}`" alt="recipe-image" class="recipe-image">
        <h2 class="recipe-name">Name:{{ recipe.title }}</h2>
        <p class="submitted-by">Chef {{ recipe.submitted_by_username }}</p>
        <p class="difficulty">Difficulty:{{ recipe.difficulty }}</p>
        <p class="category">Category:{{ recipe.category }}</p>
    </main>
</template>

<script setup>
import { defineProps } from 'vue';
    defineProps({
        recipe:{
            type: Object,
            required: true
        }
    })
</script>

<style scoped>
.recipe-card {
  width: 300px;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  margin: 1rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.recipe-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}

.image-wrapper {
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.recipe-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* ensures image fills the area without distortion */
  display: block;
}

.card-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.recipe-name {
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
  color: #333;
}

.submitted-by, .difficulty, .category {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}
</style>
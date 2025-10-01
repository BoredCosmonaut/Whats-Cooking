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
        <div class="info" v-if="user && user.info">
            <img :src="`http://localhost:8080/images/profile/${user.info.image_name}`" alt="" class="user-image">
            <p class="username">{{ user.info.username }}</p>
            <p class="points">{{ user.points }}</p>     
        </div>
        <div class="posts">
            <h2>Shared Recipes</h2>
            <div class="recipes">
                <p v-if="recipesLoading">Loading recipes...</p>
                <recipeCard
                    v-for="recipe in recipes"
                    :key="recipe.recipe_id"
                    :recipe="recipe"
                />
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Container */
.main-view {
  display: flex;
  flex-direction: column;
  padding: 2rem;
  gap: 2rem;
  font-family: Arial, sans-serif;
  background: #f9f9f9;
}

/* User info sidebar */
.info {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #fff;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.user-image {
  width: 80px;
  height: 80px;
  object-fit: cover; /* ensures image fits nicely */
  border-radius: 50%;
  border: 2px solid #ddd;
}

.username {
  font-weight: bold;
  font-size: 1.2rem;
}

.points {
  font-size: 0.9rem;
  color: #555;
}

/* Recipes section */
.posts {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.posts h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

/* Recipe cards container */
.recipes {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
</style>

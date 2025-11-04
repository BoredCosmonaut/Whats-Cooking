<script setup> 
    import { onMounted,ref,computed } from 'vue'; 
    import { useRoute } from 'vue-router';
    import { useRecipe } from '@/composables/useRecipe';
    import { useUser } from '@/composables/useUsers';
    import { useReview } from '@/composables/useReview';
    import reviewCard from '@/components/reviewCard.vue';
    import router from '@/router';
    const route = useRoute()
    const {recipe,isLoading,error,getRecipeById,deleteRecipe,addFavoriteRecipe,removeFavoriteRecipe,getFavorites} = useRecipe()
    const {user,fetchUser} = useUser();
    const {reviews,getReviewsForRecipe,postReview} = useReview()
    const recipe_id = route.params.recipeId;
    const newReview = ref({
      rating: '',
      comment: '',
      image: null,
    });
    const isFavorite = ref(false)

    const loggedInUserId = parseInt(localStorage.getItem('userId'))
    const loggedInUserRole= (localStorage.getItem('role'))
    onMounted( async() => {
        try {
            await getRecipeById(recipe_id);
            await getReviewsForRecipe(recipe_id);
            if(recipe.value?.submitted_by) {
                await fetchUser(recipe.value.submitted_by)
            }
            
            const favorites = await getFavorites();
            console.log(favorites)
            isFavorite.value = favorites.some(fav => fav.recipe_id === parseInt(recipe_id));
        } catch (error) {
            console.log('Error while getting recipe:',error)
        }
    })




    async function  handleSubmitReview() {
      try {
        if(!newReview.value.rating && !newReview.value.comment && !newReview.value.image) {
          alert('Please fill in both rating and comment.');
          return;
        }

        await postReview(recipe_id,newReview.value);
        await getReviewsForRecipe(recipe_id);
        alert('✅ Review added successfully!');
        newReview.value = { rating: '', comment: '', image: null };
      } catch (error) {
        alert('❌ Failed to post review.');
      }
    }

    function handleReviewDeleted(id) {
      reviews.value = reviews.value.filter(r => r.review_id !== id);
    }

    const canEditOrDelete = computed(() => {
      if (!recipe?.value) return false
      return (
        loggedInUserId === recipe.value.submitted_by ||
        loggedInUserRole === 'Admin'
      )
    })

    const canFavorite = computed(() => {
      if (!recipe?.value) return false
      return loggedInUserId !== recipe.value.submitted_by
    })


    async function handleFavoriteToggle() {
      try {
        if(isFavorite.value) {
          await removeFavoriteRecipe(recipe_id);
          isFavorite.value = false;
          alert('Removed from favorites')
        } else{
          await addFavoriteRecipe(recipe_id);
          isFavorite.value = true;
          alert('Added to favorites')
        }
      } catch (error) {
        alert('❌ Failed to update favorites');
      }
    }

    async function handleDeleteRecipe() {
      if (!confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) return;
      try {
        await deleteRecipe(recipe_id);
        alert('Recipe deleted!');
        router.push('/');
      } catch (error) {
        alert('❌ Failed to delete recipe.');
      }
    }

    function handleUpdateRecipe() {
      router.push(`/recipe/update/${recipe_id}`)
    }

    const sortedSteps = computed(() => {
      return recipe.value?.steps ? [...recipe.value.steps].sort((a,b) => a.step_number - b.step_number) : []
    })

</script>

<template>
  <main class="main">  
    <div  class="recipe-detail" v-if="recipe">
        <h1 class="title">{{ recipe.title }}</h1>
        <div class="meta"> 
            <p class="category">{{ recipe.category }}</p>
            <p class="diff">{{ recipe.difficulty }}</p>
            <p class="time">{{ recipe.cooking_time }}</p>
        </div>
        <div class="recipe-actions">
        <button 
          v-if="canFavorite" 
          class="favorite-btn" 
          @click="handleFavoriteToggle">
          {{ isFavorite ? '💔 Remove from Favorites' : '❤️ Add to Favorites' }}
        </button>
          <template v-if="canEditOrDelete">
              <button class="delete-btn" @click="handleDeleteRecipe">Delete Recipe</button>
              <button class="edit-btn" @click="handleUpdateRecipe">Update Recipe</button>
          </template>
        </div>
        
        <div class="submitted-by" v-if="user && user.info">
            <p class="username">{{ user.info.username }}</p>
            <img v-if="user.info.image_name" :src="`http://localhost:8080/images/profile/${user.info.image_name}`" class="user-image">
        </div>
        <img v-if="recipe.image_name"  :src="`http://localhost:8080/images/recipes/${recipe.image_name}`"  class="recipe-image">

        <section class="desc-box">
            <h2 class="desc">Description</h2>
            <p>{{ recipe.description }}</p>
        </section>

        <section class="ingredients">
            <h2 class="ing">Ingredients</h2>
            <ul>
                <li v-for="ingredient in recipe.ingredients" :key="ingredient.ingredient_id">
                    {{ ingredient.quantity }} {{ ingredient.name }}
                </li>
            </ul>
        </section>

        <section class="steps" v-if="recipe.steps?.length">
        <h2>Steps</h2>
        <ol>
            <li v-for="step in sortedSteps" :key="step.step_number">
              <strong>Step {{ step.step_number }}:</strong> {{ step.description }}
            </li>
        </ol>
        </section>

        <p v-if="isLoading">Loading...</p>
        <p v-if="error">{{ error }}</p>
    </div>

    <section class="add-review">
      <h2>Leave a Review</h2>
      <form @submit.prevent="handleSubmitReview" class="review-form">
        <label>
          Rating:
          <select v-model="newReview.rating" required>
            <option disabled value="">Select rating</option>
            <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
          </select>
        </label>

        <label>
          Comment:
          <textarea v-model="newReview.comment" required placeholder="Write your review..."></textarea>
        </label>

        <label>
          Image (optional):
          <input type="file" accept="image/*" @change="e => newReview.image = e.target.files[0]" />
        </label>

        <button type="submit" class="submit-btn">Submit Review</button>
      </form>
    </section>

    <div class="reviews" v-if="reviews.length">
      <reviewCard 
        v-for="review in reviews"
        :key="review.review_id"
        :review="review"
        :onDeleted="handleReviewDeleted"
      />
    </div>
  </main>
</template>

<style scoped>
.recipe-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.title {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.meta p {
  margin: 0.25rem 0;
}

.submitted-by {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
}

.user-image {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ddd;
}

.recipe-image {
  width: 100%;
  height: auto;
  max-height: 400px;
  object-fit: cover;
  margin: 1rem 0;
  border-radius: 8px;
}

section {
  margin-top: 1.5rem;
}

h2 {
  margin-bottom: 0.5rem;
}

.recipe-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

.delete-btn {
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.delete-btn:hover {
  background: #c0392b;
}

.favorite-btn {
  background: #ff4d6d;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  margin-right: 1rem;
  transition: background 0.2s ease;
}

.favorite-btn:hover {
  background: #e63950;
}


</style>
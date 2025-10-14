<script setup> 
    import { onMounted,ref } from 'vue'; 
    import { useRoute } from 'vue-router';
    import { useRecipe } from '@/composables/useRecipe';
    import { useUser } from '@/composables/useUsers';
    import { useReview } from '@/composables/useReview';
    import reviewCard from '@/components/reviewCard.vue';
    const route = useRoute()
    const {recipe,isLoading,error,getRecipeById} = useRecipe()
    const {user,fetchUser} = useUser();
    const {reviews,getReviewsForRecipe,postReview} = useReview()
    const recipe_id = route.params.recipeId;
    const newReview = ref({
      rating: '',
      comment: '',
      image: null,
    });


    onMounted( async() => {
        try {
            await getRecipeById(recipe_id);
            await getReviewsForRecipe(recipe_id);
            console.log(reviews);
            if(recipe.value?.submitted_by) {
                await fetchUser(recipe.value.submitted_by)
            }
            
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
            <li v-for="step in recipe.steps" :key="step.step_number">
            {{ step.description }}
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
</style>
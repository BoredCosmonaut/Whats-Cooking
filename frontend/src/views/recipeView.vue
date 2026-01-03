<script setup> 
    import { onMounted,ref,computed } from 'vue'; 
    import { useRoute } from 'vue-router';
    import { useRecipe } from '@/composables/useRecipe';
    import { useUser } from '@/composables/useUsers';
    import { useReview } from '@/composables/useReview';
    import reviewCard from '@/components/reviewCard.vue';
    import router from '@/router';
    import { toast } from 'vue3-toastify';
    import { h } from 'vue'; 
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
    //const BASE_URL = process.env.VUE_APP_API_BASE_URL;
    const SUPABASE_URL = process.env.VUE_APP_API_SUPABASE_URL;
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
          toast.warning('Lütfen puan, yorum ve görsel alanlarını doldurun.');
          return;
        }

        await postReview(recipe_id,newReview.value);
        await getReviewsForRecipe(recipe_id);
        toast.success('Yorumunuz başarıyla eklendi! ⭐');
        newReview.value = { rating: '', comment: '', image: null };
      } catch (error) {
        toast.error('Yorum gönderilirken bir hata oluştu.');
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
          toast.info('Favorilerden çıkarıldı 💔');
        } else{
          await addFavoriteRecipe(recipe_id);
          isFavorite.value = true;
          toast.success('Favorilere eklendi! ❤️');
        }
      } catch (error) {
        toast.error('Favori işlemi başarısız oldu.');
      }
    }

`    async function handleDeleteRecipe() {
      if (!confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) return;
      try {
        await deleteRecipe(recipe_id);
        toast.success('Recipe deleted!');
        router.push('/');
      } catch (error) {
        toast.error('❌ Failed to delete recipe.');
      }
    }
`

async function handleDeleteRecipe() {
  toast.info(
    ({ closeToast }) => 
      h('div', { class: 'toast-confirm-container' }, [
        h('p', { class: 'toast-text' }, 'Bu tarifi silmek istediğinize emin misiniz?'),
        h('div', { class: 'toast-actions' }, [
          h('button', { 
            class: 'toast-btn-yes', 
            onClick: async () => {
              closeToast();
              await proceedDelete();
            } 
          }, 'Evet, Sil'),
          h('button', { 
            class: 'toast-btn-no', 
            onClick: closeToast 
          }, 'Vazgeç')
        ])
      ]),
    {
      position: 'top-center',
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      icon: false
    }
  );
}

// proceedDelete fonksiyonu aynı kalıyor
async function proceedDelete() {
  try {
    await deleteRecipe(recipe_id);
    toast.success('Tarif başarıyla silindi 🌿');
    router.push('/');
  } catch (error) {
    toast.error('Silme işlemi başarısız oldu.');
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
    <div class="recipe-detail" v-if="recipe">
        
        <h1 class="title">{{ recipe.title }}</h1>
        <hr class="green-divider">

        <div class="header-content">
            
            <div class="image-area">
                <img v-if="recipe.image_name" 
                    :src="`${SUPABASE_URL}/images/recipes/${recipe.image_name}`" 
                    class="recipe-image"
                >
                <div class="recipe-actions">
                    <button 
                      v-if="canFavorite" 
                      class="favorite-btn" 
                      @click="handleFavoriteToggle"
                    >
                      {{ isFavorite ? '💔 Remove from Favorites' : '❤️ Add to Favorites' }}
                    </button>
                    <template v-if="canEditOrDelete">
                        <button class="edit-btn" @click="handleUpdateRecipe">Update</button>
                        <button class="delete-btn" @click="handleDeleteRecipe">Delete</button>
                    </template>
                </div>
            </div>
            
            <div class="meta-info">
                
                <section class="meta-box">
                    <p class="meta-item"><span class="label">Category:</span> {{ recipe.category }}</p>
                    <p class="meta-item"><span class="label">Difficulty:</span> {{ recipe.difficulty }}</p>
                    <p class="meta-item"><span class="label">Cooking Time:</span> {{ recipe.cooking_time }} minutes</p>
                </section>

                <div class="submitted-by" v-if="user && user.info">
                    <p class="label">Submitted By:</p>
                    <img v-if="user.info.image_name" 
                        :src="`${SUPABASE_URL}/images/profile/${user.info.image_name}`" 
                        class="user-image"
                    >
                    <p class="username">{{ user.info.username }}</p>
                </div>
                
                <section class="desc-box">
                    <h2 class="section-title">Description</h2>
                    <p class="description-text">{{ recipe.description }}</p>
                </section>
                
            </div>
        </div>
        <hr class="green-divider">

        <div class="preparation-sections">
            <section class="ingredients">
                <h2 class="section-title">Ingredients</h2>
                <ul class="ingredient-list">
                    <li v-for="ingredient in recipe.ingredients" :key="ingredient.ingredient_id">
                        {{ ingredient.quantity }} {{ ingredient.name }}
                    </li>
                </ul>
            </section>
            
            <section class="steps" v-if="recipe.steps?.length">
                <h2 class="section-title">Steps</h2>
                <ol class="step-list">
                    <li v-for="step in sortedSteps" :key="step.step_number">
                        <span class="step-number-label">Step {{ step.step_number }}:</span> {{ step.description }}
                    </li>
                </ol>
            </section>
        </div>

        <p v-if="isLoading">Loading...</p>
        <p v-if="error">{{ error }}</p>
    </div>

    <hr class="green-divider">

    <section class="add-review">
        <h2 class="section-title">Leave a Review</h2>
        <form @submit.prevent="handleSubmitReview" class="review-form">
            <div class="form-group">
                <label for="rating">Rating:</label>
                <select id="rating" v-model="newReview.rating" required class="input-field">
                    <option disabled value="">Select rating</option>
                    <option v-for="n in 5" :key="n" :value="n">{{ n }} ⭐</option>
                </select>
            </div>

            <div class="form-group">
                <label for="comment">Comment:</label>
                <textarea id="comment" v-model="newReview.comment" required placeholder="Write your review..." class="input-field" maxlength="100"></textarea>
            </div>

            <div class="form-group">
                <label>Image:</label>
                <input type="file" accept="image/*" @change="e => newReview.image = e.target.files[0]" class="input-field file-input"  required/>
            </div>
            <p class="helper-text">Maksimum dosya boyutu: 5MB</p>
            <button type="submit" class="submit-btn" :disabled="isLoading || (newReview.image && newReview.image.size >5*1024*1024) " :class="{ 'disabled-btn': newReview.image && newReview.image.size > 5*1024*1024 }">Submit Review</button>
        </form>
    </section>

    <div class="reviews-section" v-if="reviews.length">
        <h2 class="section-title">User Reviews ({{ reviews.length }})</h2>
        <div class="review-list">
            <reviewCard 
              v-for="review in reviews"
              :key="review.review_id"
              :review="review"
              :onDeleted="handleReviewDeleted"
            />
        </div>
    </div>
  </main>
</template>

<style scoped>
/* Hex Codes Used:
#4CAF50 - Primary Green
#1B5E20 - Dark Green
#E8F5E9 - Very Light Green
#E0E0E0 - Light Gray
#FFFFFF - White
*/

.main {
    max-width: 1000px; 
    margin: 0 auto;
    padding: 2rem 1rem;
}

.recipe-detail {
    padding: 0;
    background: #fff;
    border-radius: 8px;
}

.title {
    font-size: 2.5rem;
    color: #1B5E20; 
    margin-bottom: 0.5rem;
    text-align: center;
}

.section-title {
    font-size: 1.5rem;
    color: #4CAF50; 
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #E8F5E9; 
}

.green-divider {
    border: none;
    border-top: 1px solid #A5D6A7; 
    margin: 1.5rem 0;
}

.label {
    font-weight: bold;
    color: #1B5E20;
    margin-right: 0.5rem;
}

.header-content {
    display: grid;
    grid-template-columns: 2fr 1fr; 
    gap: 2rem;
}

.image-area {
    display: flex;
    flex-direction: column;
}

.recipe-image {
    width: 100%;
    height: 350px; 
    object-fit: cover;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 1rem;
}


.meta-info {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 0.5rem 0;
}

.meta-box p {
    font-size: 1rem;
    padding: 0.25rem 0;
    border-bottom: 1px dashed #E0E0E0;
    color: #444;
}

.description-text {
    line-height: 1.6;
    color: #555;
    font-style: italic;
}

.submitted-by {
    display: flex;
    align-items: center;
    padding: 10px;
    background-color: #E8F5E9; /* Light green background */
    border-radius: 6px;
}

.submitted-by .label {
    margin-right: 1rem;
}

.user-image {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #4CAF50;
    margin-right: 0.5rem;
}

.username {
    font-weight: bold;
    color: #1B5E20;
    margin: 0;
}


.recipe-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
}

.favorite-btn, .edit-btn, .delete-btn {
    padding: 0.6rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s ease;
    border: none;
}

.favorite-btn {
    background: #A5D6A7; 
    color: #1B5E20;
}

.favorite-btn:hover {
    background: #4CAF50;
    color: #FFFFFF;
}

.edit-btn {
    background: #4CAF50;
    color: white;
}
.edit-btn:hover {
    background: #1B5E20;
}

.delete-btn {
    background: #f44336;
    color: white;
}
.delete-btn:hover {
    background: #d32f2f;
}

.preparation-sections {
    display: grid;
    grid-template-columns: 1fr 2fr; 
    gap: 3rem;
    margin-bottom: 2rem;
    padding-top: 1rem;
}

.ingredient-list {
    list-style-type: none; 
    padding-left: 0;
}

.ingredient-list li {
    padding: 0.4rem 0;
    border-bottom: 1px dashed #E8F5E9;
    color: #555;
}

.step-list {
    padding-left: 20px;
}

.step-list li {
    margin-bottom: 1rem;
    line-height: 1.5;
    color: #333;
}

.step-number-label {
    font-weight: bold;
    color: #4CAF50;
    margin-right: 0.5rem;
}


.add-review {
    padding: 1.5rem;
    background-color: #f9f9f9; 
    border-radius: 8px;
    margin-bottom: 2rem;
}

.review-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-group {
    display: flex;
    flex-direction: column;
}

.form-group label {
    font-weight: 600;
    margin-bottom: 0.25rem;
    color: #1B5E20;
}

.input-field {
    padding: 0.6rem;
    border: 1px solid #E0E0E0;
    border-radius: 4px;
    font-size: 1rem;
    transition: border-color 0.2s;
}

.input-field:focus {
    border-color: #4CAF50;
    outline: none;
}

textarea.input-field {
    resize: vertical;
    min-height: 80px;
}

.submit-btn {
    background: #4CAF50;
    color: white;
    padding: 0.75rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 700;
    transition: background 0.2s;
}

.submit-btn:hover {
    background: #1B5E20;
}


.reviews-section {
    padding: 1rem 0;
}

.review-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
    gap: 2.5rem; 
    justify-content: center;
}


@media (max-width: 768px) {
    .header-content {
        grid-template-columns: 1fr; 
    }
    
    .preparation-sections {
        grid-template-columns: 1fr;
    }
    
    .recipe-image {
        height: 250px; 
    }
}
</style>
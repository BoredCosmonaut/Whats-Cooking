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




    async function handleSubmitReview() {
      try {
        if(!newReview.value.rating && !newReview.value.comment && !newReview.value.image) {
          toast.warning('Lütfen puan, yorum ve görsel alanlarını doldurun.');
          return;
        }
        await postReview(recipe_id,newReview.value);
        await getReviewsForRecipe(recipe_id);
        toast.success('Yorumunuz başarıyla eklendi!');
        newReview.value = { rating: '', comment: '', image: null };
      } catch (error) {
        const backendMessage = error.response?.data?.message || 'Bir hata oluştu.';
        toast.error(backendMessage); 
        console.log("Toast'ta gösterilen mesaj:", backendMessage);
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
          toast.info('Favorilerden çıkarıldı');
        } else{
          await addFavoriteRecipe(recipe_id);
          isFavorite.value = true;
          toast.success('Favorilere eklendi!');
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
        h('p', { class: 'toast-text' }, 'Do you want to delete the recipe'),
        h('div', { class: 'toast-actions' }, [
          h('button', { 
            class: 'toast-btn-yes', 
            onClick: async () => {
              closeToast();
              await proceedDelete();
            } 
          }, 'Yes'),
          h('button', { 
            class: 'toast-btn-no', 
            onClick: closeToast 
          }, 'Cancel')
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
        toast.success('Tarif başarıyla silindi');
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
/* Renk Paleti: #4CAF50 (Yeşil), #1B5E20 (Koyu Yeşil), #E8F5E9 (Açık Yeşil) */

.main {
    max-width: 1000px; 
    margin: 0 auto;
    padding: 2rem 1rem;
    word-wrap: break-word; /* Genel bir güvenlik önlemi */
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
    line-height: 1.2;
    /* Taşma Düzeltmeleri */
    width: 100%;
    overflow-wrap: anywhere; /* break-word'den daha agresiftir */
    word-break: break-word;
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

.header-content {
    display: grid;
    grid-template-columns: 2fr 1fr; 
    gap: 2rem;
    /* Grid taşmalarını engellemek için kritik */
    min-width: 0; 
}

/* Sağ taraftaki meta ve açıklama sütunu */
.meta-info {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 0.5rem 0;
    /* İçeriğin sütunu genişletmesini engeller */
    min-width: 0; 
}

.desc-box {
    width: 100%;
    min-width: 0;
    overflow-wrap: break-word;
}

.description-text {
    line-height: 1.6;
    color: #555;
    font-style: italic;
    width: 100%;
    /* Hem satır sonlarını korur hem de taşmayı engeller */
    white-space: pre-wrap; 
    overflow-wrap: break-word;
    word-break: break-word;
}

/* Diğer Bileşenler */
.image-area {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.recipe-image {
    width: 100%;
    height: 350px; 
    object-fit: cover;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 1rem;
}

.meta-box p {
    font-size: 1rem;
    padding: 0.25rem 0;
    border-bottom: 1px dashed #E0E0E0;
    color: #444;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap; 
    gap: 5px;
}

.label {
    font-weight: bold;
    color: #1B5E20;
}

.submitted-by {
    display: flex;
    align-items: center;
    padding: 10px;
    background-color: #E8F5E9;
    border-radius: 6px;
    min-width: 0;
}

.user-image {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #4CAF50;
    margin-right: 0.5rem;
    flex-shrink: 0; /* Resmin ezilmesini önler */
}

.username {
    font-weight: bold;
    color: #1B5E20;
    overflow: hidden;
    text-overflow: ellipsis;
}

.recipe-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
    flex-wrap: wrap;
}

.favorite-btn, .edit-btn, .delete-btn {
    padding: 0.6rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s ease;
    border: none;
}

.favorite-btn { background: #A5D6A7; color: #1B5E20; }
.edit-btn { background: #4CAF50; color: white; }
.delete-btn { background: #f44336; color: white; }

.preparation-sections {
    display: grid;
    grid-template-columns: 1fr 2fr; 
    gap: 3rem;
    margin-bottom: 2rem;
    padding-top: 1rem;
    min-width: 0;
}

.ingredient-list li, .step-list li {
    overflow-wrap: break-word;
    word-break: break-word;
}

.add-review {
    margin: 4rem 0;
    padding: 2.5rem;
    background: #fbfdfb;
    border-radius: 4px;
}

.review-form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    max-width: 100%; /* Genişlik artırıldı */
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
}

.input-field {
    padding: 1rem 0;
    border: none;
    border-bottom: 1px solid #e0e0e0;
    background: transparent;
    font-size: 1.05rem;
    transition: border-color 0.3s;
    width: 100%;
}

.input-field:focus {
    outline: none;
    border-bottom: 1.5px solid #2d5a27;
}

textarea.input-field {
    resize: none;
    min-height: 100px;
}

.submit-btn {
    background: #2d5a27;
    color: white;
    padding: 1rem 2.5rem;
    border: none;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    cursor: pointer;
    align-self: flex-start;
}

.submit-btn:hover:not(.disabled-btn) {
    background: #1B5E20;
}

.helper-text {
    font-size: 0.8rem;
    color: #999;
    margin-top: -1rem;
}
.review-list {
    display: grid;
    /* 300px genişliğinde kartlar oluşturur, sığmadığında alta atar */
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); 
    gap: 2rem;
    padding: 1rem 0;
    width: 100%;
}

@media (max-width: 768px) {
    .title { font-size: 1.8rem; }
    .header-content, .preparation-sections {
        grid-template-columns: 1fr;
    }
    .recipe-image { height: 250px; }
}
</style>
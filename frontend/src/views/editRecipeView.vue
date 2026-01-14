<script setup>
    import {ref,onMounted} from 'vue'
    import { useRoute,useRouter } from 'vue-router';
    import { useRecipe } from '@/composables/useRecipe';
    import { toast } from 'vue3-toastify';
    const route = useRoute();
    const router = useRouter();

    const recipe_id = route.params.recipe_id;    
    const {getRecipeById,updateRecipe,updateRecipeImage,isLoading,error} = useRecipe()

    const title = ref();
    const description = ref();
    const cooking_time= ref();
    const category = ref();
    const difficulty = ref();
    const ingredients = ref([{ name: '', quantity: '' }]);
    const steps = ref([{ description: '', step_number: 1 }]);
    const imageFile = ref(null);
    const image_name = ref(null);
    const imageUrl = ref(null)
    const SUPABASE_URL = process.env.VUE_APP_API_SUPABASE_URL;
    onMounted(async() => {
        const data = await getRecipeById(recipe_id);
        if(data) {
            title.value = data.recipe.title;
            description.value = data.recipe.description;
            category.value = data.recipe.category;
            cooking_time.value = data.recipe.cooking_time;
            difficulty.value = data.recipe.difficulty;
            ingredients.value = data.recipe.ingredients?.length ? data.recipe.ingredients : [{ name: '', quantity: '' }]
            steps.value = data.recipe.steps?.length ? data.recipe.steps.map(s => ({ description: s.description || s.instruction || '',step_number: s.step_number || 1})) : [{ description: '', step_number: 1 }];
            image_name.value = data.recipe.image_name
        }
      imageUrl.value = `${SUPABASE_URL}/images/recipes/${image_name.value}`  
    })

    function addIngredient() {
        ingredients.value.push({name:'',quantity:''})
    }

    function addSteps() {
      steps.value.push({
        description: '',
        step_number: steps.value.length + 1
      })
    }

    function removeIngredient(index) {
      ingredients.value.splice(index, 1);
      if (ingredients.value.length === 0) {
        ingredients.value.push({ name: '', quantity: '' });
      }
    }

    function removeStep(index) {
      steps.value.splice(index, 1);
      steps.value.forEach((s, i) => s.step_number = i + 1);
      if (steps.value.length === 0) {
        steps.value.push({ description: '', step_number: 1 });
      }
    }



    function handleFileUpload(e) {
        imageFile.value = e.target.files[0];
        if(imageFile.value) {
            imageUrl.value = URL.createObjectURL(imageFile.value)
        }
    }

async function handleUpdate() {
    try {
        console.log("1. Update başlatılıyor...");
        const payload = {
            title: title.value,
            description: description.value,
            category: category.value,
            cooking_time: cooking_time.value,
            difficulty: difficulty.value,
            ingredients: JSON.stringify(ingredients.value),
            steps: JSON.stringify(steps.value.map(s => s.description.trim()))
        }

        const res = await updateRecipe(recipe_id, payload);
        console.log("2. Başarılı yanıt:", res);
        
        toast.success('Recipe Updated! 🌿');
        router.push(`/recipe/${recipe_id}`);
    } catch (err) {
        console.error("3. Yakalanan hata objesi:", err); // Burayı kontrol et
        
        // Hata mesajını daha derinlemesine ara
        const errorMessage = 
            err.response?.data?.message || 
            err.response?.data?.errors?.[0]?.msg || 
            err.message || 
            'Failed to update recipe';
            
        toast.error(errorMessage);
    }
}

    async function handleImageUpload() {
        if(!imageFile.value) {
            toast.warning('Please select an image first');
            return
        }

        const maxSizeInBytes = 5*1024*1024
        if(imageFile.value.size > maxSizeInBytes) {
          toast.warning(`Image size too big`)
          return
        } 

        const formData = new FormData();
        formData.append('image',imageFile.value);

        const res = await updateRecipeImage(recipe_id,formData)
        if(res) {
            toast.success('recipe image updated');
        }
    }

</script>

<template>
    <main class="edit-recipe">
        <h1>Edit Recipe</h1>
            <section class="image-section">
            <h3>Update Image</h3>
            <input type="file" accept="image/*" @change="handleFileUpload" />
            <p class="helper-text">Maksimum dosya boyutu: 5MB</p>
            <img v-if="imageUrl" :src="imageUrl" class="preview" />
            <button @click="handleImageUpload" class="upload-btn" :class="{ 'disabled-btn': imageFile && imageFile.size > 5 * 1024 * 1024 }" :disabled="imageFile && imageFile.size >5*1024*1024 ">Upload New Image</button>
            </section>
            <form class="form" @submit.prevent="handleUpdate">
                <label>Title</label>
                <input v-model="title" type="text" required maxlength="100" />

                <label>Description</label>
                <input v-model="description" type="text" required maxlength="100" />

                <label>Category</label>
                <input v-model="category" type="text" required maxlength="15" />

                <label>Cooking Time</label>
                <input v-model="cooking_time" placeholder="e.g. 30 mins" required maxlength="10" />

                <label>Difficulty</label>
                <select v-model="difficulty" required>
                    <option disabled value="">Select difficulty</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                </select>

                <section class="ingredients">
                  <h3>Ingredients</h3>
                  <div 
                    v-for="(ing, i) in ingredients" 
                    :key="i" 
                    class="ingredient-row"
                  >
                    <input v-model="ing.name" placeholder="Ingredient" type="text" required maxlength="100" />
                    <input v-model="ing.quantity" placeholder="Quantity" type="text" required maxlength="100"/>
                    <button 
                      type="button" 
                      class="remove-btn" 
                      @click="removeIngredient(i)"
                    >
                      ✖
                    </button>
                  </div>

                  <button 
                    type="button" 
                    @click="addIngredient" 
                    class="add-btn" 
                    :disabled="!ingredients.at(-1)?.name || !ingredients.at(-1)?.quantity"
                  >
                    + Add Ingredient
                  </button>
                </section>

                <section class="steps">
                  <h3>Steps</h3>
                  <div 
                    v-for="(step, i) in steps" 
                    :key="i" 
                    class="step-row"
                  >
                    <label>Step {{ step.step_number || i + 1 }}</label>
                    <textarea 
                      v-model="step.description" 
                      placeholder="Describe step..." 
                      required maxlength="250"
                    ></textarea>
                    <button 
                      type="button" 
                      class="remove-btn" 
                      @click="removeStep(i)"
                    >
                      ✖
                    </button>
                  </div>

                  <button 
                    type="button" 
                    @click="addSteps" 
                    class="add-btn" 
                    :disabled="!steps.at(-1)?.description"
                  >
                    + Add Step
                  </button>
                </section>

                <button type="submit" class="submit-btn" :disabled="isLoading">
                    {{ isLoading ? "Updating..." : "Update Recipe" }}
                </button>

                <p v-if="error" class="error">{{ error }}</p>
                </form>
    </main>
</template>

<style scoped>
/* Ana Konteyner - Clutter-free & Minimalist */
.edit-recipe {
  max-width: 1000px;
  margin: 2rem auto;
  padding: 3rem 1.5rem;
  background: #ffffff;
  color: #333;
}

h1 {
  font-size: 2.2rem;
  color: #2d5a27; /* Orman Yeşili */
  font-weight: 300;
  text-align: center;
  margin-bottom: 3rem;
  letter-spacing: -1px;
}

h3 {
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #888;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 0.5rem;
}

/* Form Yapısı */
.form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Input ve Label Stilleri */
label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #2d5a27;
  margin-bottom: -1.2rem; /* Label'ı inputa yaklaştırır */
}

input, textarea, select {
  padding: 0.8rem 0;
  border: none;
  border-bottom: 1px solid #e0e0e0;
  border-radius: 0;
  font-size: 1.05rem;
  background: transparent;
  transition: all 0.3s ease;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-bottom: 1.5px solid #2d5a27;
}

/* Resim Bölümü */
.image-section {
  background: #fbfdfb;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 3rem;
  border: 1px dashed #e0e8e0;
}

.preview {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 4px;
  margin: 1.5rem 0;
}

/* Dinamik Satırlar (Ingredients & Steps) */
.ingredient-row {
  display: grid;
  grid-template-columns: 2fr 1fr 40px;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}

.step-row {
  display: flex;
  align-items: flex-start; /* Üst hizalı kalsınlar */
  gap: 1rem;
  margin-bottom: 1.5rem;
  width: 100%;
}

.step-content {
  display: flex;
  flex-direction: column;
  flex-grow: 1; 
  gap: 0.5rem;
}


textarea {
  width: 100%;
  resize: none; 
  min-height: 80px; 
  padding: 0.8rem;
  border: 1px solid #f0f0f0; 
  border-bottom: 1px solid #e0e0e0;
}

.step-row label {
    margin-bottom: 0.5rem;
}

/* Butonlar */
.submit-btn {
  background: #2d5a27;
  color: white;
  border: none;
  padding: 1.2rem;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  transition: opacity 0.3s;
  margin-top: 2rem;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.add-btn {
  background: transparent;
  color: #2d5a27;
  border: 1px solid #2d5a27;
  padding: 0.6rem;
  font-size: 0.9rem;
  border-radius: 4px;
  cursor: pointer;
  align-self: flex-start;
}

.add-btn:hover {
  background: #f1f8f1;
}

.upload-btn {
  background: #6b8e23; /* Zeytin Yeşili */
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.remove-btn {
  margin-top: 2.2rem; /* Label hizasından aşağı indirmek için */
  background: transparent;
  border: none;
  color: #ccc;
  cursor: pointer;
  font-size: 1.2rem;
  transition: color 0.2s;
  padding: 5px;
}

.remove-btn:hover {
  color: #d32f2f;
}

/* Yardımcı Metinler */
.helper-text {
  font-size: 0.75rem;
  color: #999;
  margin-bottom: 1rem;
}

.error {
  color: #d32f2f;
  background: #fff5f5;
  padding: 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  text-align: center;
}

/* Disabled Durumu */
.disabled-btn, :disabled {
  background: #f5f5f5 !important;
  color: #bbb !important;
  border-color: #eee !important;
  cursor: not-allowed;
}

@media (max-width: 600px) {
  .edit-recipe {
    padding: 1.5rem;
  }
  .ingredient-row {
    grid-template-columns: 1fr;
  }
}
</style>
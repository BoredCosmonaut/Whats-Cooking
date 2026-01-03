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
        const payload = {
            title:title.value,
            description: description.value,
            category: category.value,
            cooking_time: cooking_time.value,
            difficulty: difficulty.value,
            ingredients: ingredients.value,
            steps: steps.value.map(s => s.description.trim())
        }

        const res = await updateRecipe(recipe_id,payload);
        if(res) {
            toast.success('Recipe Updated!')
            router.push(`/recipe/${recipe_id}`)
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
.edit-recipe {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

label {
  font-weight: 500;
  color: #444;
}

input, textarea, select {
  padding: 0.7rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  width: 100%;
}

textarea {
  resize: vertical;
}

.ingredient-row, .step-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.add-btn, .submit-btn, .upload-btn {
  background: #2c7be5;
  color: #fff;
  border: none;
  padding: 0.7rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.add-btn:hover, .submit-btn:hover, .upload-btn:hover {
  background: #1a5fc4;
}

.image-section {
  margin-top: 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  width: 50%;
  align-items: center;
  justify-content: center;
  margin: auto;
}

.preview {
  width: 100%;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  margin-top: 1rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.error {
  color: red;
  margin-top: 1rem;
  text-align: center;
}

.helper-text {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  font-family: sans-serif;
}

.disabled-btn {
  background-color: #e8f5e9 !important; 
  color: #a5d6a7 !important;
  cursor: not-allowed; 
}
</style>
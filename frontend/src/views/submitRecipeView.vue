<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useRecipe } from '@/composables/useRecipe';
import { useObjectUrl } from '@vueuse/core';
import { toast } from 'vue3-toastify';

const { submitRecipe, error, isLoading } = useRecipe();
const router = useRouter();

const title = ref('');
const description = ref('');
const category = ref('');
const cooking_time = ref('');
const difficulty = ref('');
const ingredients = ref([]);
const steps = ref([]);
const image = ref(null);
const imageUrl = useObjectUrl(image);

onMounted(() => {
  if (ingredients.value.length === 0) addIngredient();
  if (steps.value.length === 0) addStep();
});

function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    toast.warning("File is too large! Max 5MB allowed.");
    e.target.value = '';
    image.value = null;
    return;
  }
  image.value = file;
}

const addIngredient = () => ingredients.value.push({ name: '', quantity: '' });
const removeIngredient = (index) => ingredients.value.splice(index, 1);

const addStep = () => steps.value.push('');
const removeStep = (index) => steps.value.splice(index, 1);

async function handleSubmit() {
  const filteredIngredients = ingredients.value.filter(ing => ing.name.trim() !== '');
  const filteredSteps = steps.value.filter(step => step.trim() !== '');

  if (filteredIngredients.length === 0 || filteredSteps.length === 0) {
    return toast.warning('Please add at least one step and ingredient');
  }

  const formData = new FormData();
  formData.append('title', title.value);
  formData.append('description', description.value);
  formData.append('category', category.value);
  formData.append('cooking_time', cooking_time.value);
  formData.append('difficulty', difficulty.value);
  formData.append('ingredients', JSON.stringify(filteredIngredients));
  formData.append('steps', JSON.stringify(filteredSteps));
  if (image.value) formData.append('image', image.value);

  try {
    const res = await submitRecipe(formData);
    toast.success(res.message || 'Recipe submitted! ');
    router.push(`/recipe/${res.recipe.recipe_id}`);
  } catch (err) {
    toast.error(err.response?.data?.message || 'Submission failed');
  }
}
</script>

<template>
  <main class="submit-recipe">
    <h1 class="title">Share Your Recipe</h1>

    <form class="form" @submit.prevent="handleSubmit">
      <section class="basic-info">
        <label>Title</label>
        <input v-model="title" placeholder="What's the name of your dish?" type="text" required maxlength="100">

        <label>Short Description</label>
        <textarea v-model="description" placeholder="A little bit about this recipe..." required maxlength="250"></textarea>

        <div class="form-row">
          <div class="field">
            <label>Category</label>
            <input v-model="category" placeholder="e.g. Pasta, Vegan" required />
          </div>
          <div class="field">
            <label>Cooking Time</label>
            <input v-model="cooking_time" placeholder="e.g. 45 mins" required type="number" />
          </div>
          <div class="field">
            <label>Difficulty</label>
            <select v-model="difficulty" required>
              <option disabled value="">Select</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>
      </section>

      <section class="dynamic-section">
        <h3>Ingredients</h3>
        <div v-for="(ing, i) in ingredients" :key="i" class="dynamic-row">
          <input v-model="ing.name" placeholder="Ingredient" class="flex-2" required>
          <input v-model="ing.quantity" placeholder="Qty" class="flex-1" required>
          <button v-if="ingredients.length > 1" type="button" @click="removeIngredient(i)" class="remove-btn">×</button>
        </div>
        <button type="button" @click="addIngredient" class="add-btn" :disabled="!ingredients.at(-1)?.name">+ Add Ingredient</button>
      </section>

      <section class="dynamic-section">
        <h3>Steps</h3>
        <div v-for="(step, i) in steps" :key="i" class="dynamic-row">
          <span class="step-num">{{ i + 1 }}</span>
          <textarea v-model="steps[i]" placeholder="Describe this step..." required></textarea>
          <button v-if="steps.length > 1" type="button" @click="removeStep(i)" class="remove-btn">×</button>
        </div>
        <button type="button" @click="addStep" class="add-btn" :disabled="!steps.at(-1)?.trim()">+ Add Step</button>
      </section>
      
      <section class="upload-section">
        <label>Recipe Photo</label>
        <div class="file-input-wrapper">
          <input type="file" accept="image/*" @change="handleFileUpload" :required="!imageUrl">
          <p class="helper-text">High quality photos get more likes! (Max 5MB)</p>
        </div>
        <img v-if="imageUrl" :src="imageUrl" alt="Preview" class="preview" />
      </section>

      <button type="submit" class="submit-btn" :disabled="isLoading">
        {{ isLoading ? "Saving Recipe..." : "Publish Recipe " }}
      </button>

      <p v-if="error" class="error-msg">{{ error }}</p>
    </form>
  </main>
</template>

<style scoped>
.submit-recipe {
  max-width: 800px;
  margin: 3rem auto;
  padding: 0 1.5rem;
}

.title {
  color: #1B5E20;
  font-size: 2.2rem;
  margin-bottom: 2.5rem;
  text-align: center;
}

.form section {
  margin-bottom: 3rem;
}

.form-row {
  display: flex;
  gap: 1.5rem;
}

.field { flex: 1; }

label {
  display: block;
  font-weight: 700;
  color: #1B5E20;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

input, select, textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  background: #fff;
}

input:focus, textarea:focus {
  border-color: #4CAF50;
  outline: none;
  box-shadow: 0 0 0 3px #E8F5E9;
}

h3 {
  color: #4CAF50;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #E8F5E9;
  padding-bottom: 0.5rem;
}

.dynamic-row {
  display: flex;
  gap: 0.8rem;
  margin-bottom: 0.8rem;
  align-items: center;
}

.flex-2 { flex: 2; }
.flex-1 { flex: 1; }

.step-num {
  font-weight: 700;
  color: #4CAF50;
  background: #E8F5E9;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
}

.remove-btn {
  background: none;
  border: none;
  color: #ccc;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0 5px;
}

.remove-btn:hover { color: #ff4d4f; }

.add-btn {
  background: #fff;
  color: #4CAF50;
  border: 1px dashed #4CAF50;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 0.5rem;
}

.add-btn:hover:not(:disabled) { background: #F1F8F1; }

.submit-btn {
  background: #1B5E20;
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 12px;
  width: 100%;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #2E7D32;
  transform: translateY(-2px);
}

.preview {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 12px;
  margin-top: 1rem;
}

.helper-text { font-size: 0.8rem; color: #888; margin-top: 0.3rem; }

@media (max-width: 600px) {
  .form-row { flex-direction: column; gap: 0; }
  .submit-recipe { padding: 1rem; }
}
</style>
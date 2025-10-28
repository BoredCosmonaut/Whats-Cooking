<script setup>
    import { ref } from 'vue';
    import { useRouter } from 'vue-router';
    import { useRecipe } from '@/composables/useRecipe';
    import { useObjectUrl } from '@vueuse/core';

    const{submitRecipe,error,isLoading} = useRecipe()
    const router = useRouter();

    const title = ref('');
    const description = ref('');
    const category = ref('');
    const cooking_time = ref('');
    const difficulty = ref('')
    const ingredients = ref([{name:'',quantity:''}]);
    const steps = ref(['']);
    const image = ref(null);
    const imageUrl = useObjectUrl(image);

    function handleFileUpload(e) {
        image.value = e.target.files[0];
    }

    function addIngredient() {
        ingredients.value.push({name:'',quantity:''});
    }

    function addSteps() {
        steps.value.push('');
    }

    async function handleSubmit() {
        const formData = new FormData();

        formData.append('title', title.value);
        formData.append('description',description.value);
        formData.append('category',category.value);
        formData.append('cooking_time',cooking_time.value);
        formData.append('difficulty',difficulty.value);
        formData.append('ingredients',JSON.stringify(ingredients.value));
        formData.append('steps', JSON.stringify(steps.value));
        if (image.value) formData.append('image', image.value);

        try {
            const res = await submitRecipe(formData);
            alert(res.message);
            router.push(`/recipe/${res.recipe.recipe_id}`)
        } catch(error)  {
            alert('Recipe couldnt be submited')
        }
    }

</script>

<template>
    <main class="submit-recipe">
        <h1 class="title">Submit your recipe</h1>

        <form class="form" @submit.prevent="handleSubmit">
            <label>Title</label>
            <input v-model="title" placeholder="Recipe title" type="text" required>

            <label>Description</label>
            <input v-model="description" placeholder="Recipe Description" type="text" required>

            <label>Category</label>
            <input v-model="category" placeholder="e.g. Italian, Dessert..." required />

            <label>Cooking Time</label>
            <input v-model="cooking_time" placeholder="e.g. 30 mins" required />

            <label>Difficulty</label>
            <select v-model="difficulty" required>
                <option disabled value="">Select difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
            </select>

            <section class="ingredients">
                <h3>Ingredients</h3>
                <div v-for="(ing, i) in ingredients" :key="i" class="ingredients">
                    <input v-model="ing.name" placeholder="Ingredient" required  type="text">
                    <input v-model="ing.quantity" placeholder="Quantity" required type="text">
                </div>
                <button type="button" @click="addIngredient" class="add-btn" :disabled="!ingredients.at(-1).name || !ingredients.at(-1).quantity">+ Add Ingredient</button>
            </section>

            <section class="steps">
                <h3>Steps</h3>
                <div v-for="(step, i) in steps" :key="i" class="steps">
                    <textarea  v-model="steps[i]" placeholder="Describe step.." required></textarea>
                </div>
                <button type="button" @click="addSteps" class="add-btn" :disabled="!steps.at(-1)">+ Add step</button>
            </section>
            
            <label>Upload Image</label>
            <input type="file" accept="image/*" @change="handleFileUpload">
            <img
            v-if="imageUrl"
            :src="imageUrl"
            alt="Recipe preview"
            class="preview"
            />
            <button type="submit" class="submit-btn" :disabled="isLoading">
                {{ isLoading ? "Submitting..." : "Submit Recipe" }}
            </button>

            <p v-if="error" class="error">{{ error }}</p>
        </form>
    </main>

</template>

<style scoped>
.submit-recipe {
  max-width: 800px;
  margin: 2rem auto;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.title {
  text-align: center;
  margin-bottom: 1.5rem;
}

.form label {
  display: block;
  margin-top: 1rem;
  font-weight: 600;
}

input, textarea, select {
  width: 100%;
  margin-top: 0.25rem;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

textarea {
  resize: vertical;
  min-height: 80px;
}

.ingredient {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.add-btn {
  margin-top: 0.5rem;
  background: #eee;
  border: none;
  border-radius: 8px;
  padding: 0.4rem 1rem;
  cursor: pointer;
}

.submit-btn {
  margin-top: 1.5rem;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  width: 100%;
}

.error {
  color: red;
  text-align: center;
  margin-top: 1rem;
}

.preview {
  margin-top: 1rem;
  max-width: 100%;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
</style>
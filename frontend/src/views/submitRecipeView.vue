<script setup>
    import { ref,onMounted } from 'vue';
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
    const ingredients = ref([]);
    const steps = ref([]);
    const image = ref(null);
    const imageUrl = useObjectUrl(image);

    onMounted(() => {
      // Check if the arrays are empty, and if so, add the first blank item.
      if (ingredients.value.length === 0) {
          ingredients.value.push({name:'',quantity:''});
      }
      if (steps.value.length === 0) {
          steps.value.push('');
      }
    });


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
                    <input v-model="ing.name" placeholder="Ingredient"   type="text">
                    <input v-model="ing.quantity" placeholder="Quantity"  type="text">
                </div>
                <button 
                  type="button" 
                  @click="addIngredient" 
                  class="add-btn" 
                  :disabled="ingredients.length === 0 || !ingredients.at(-1).name || !ingredients.at(-1).quantity"
                >
                  + Add Ingredient
                </button>
            </section>

            <section class="steps">
                <h3>Steps</h3>
                <div v-for="(step, i) in steps" :key="i" class="steps">
                    <textarea  v-model="steps[i]" placeholder="Describe step.."></textarea>
                </div>
                <button 
                    type="button" 
                    @click="addSteps" 
                    class="add-btn" 
                    :disabled="steps.length === 0 || !steps.at(-1).trim()"
                >
                    + Add step
                </button>
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
/* Hex Codes Used:
#4CAF50 - Primary Green (Button, Focus, Highlights)
#1B5E20 - Dark Green (Headings, Text)
#E8F5E9 - Very Light Green (Subtle Backgrounds, Borders)
#E0E0E0 - Light Gray (Default Borders)
#FFFFFF - White (Background)
*/

.submit-recipe {
    max-width: 750px; /* Slightly narrower for focus */
    margin: 2rem auto;
    background: #FFFFFF;
    padding: 2.5rem; /* More spacious padding */
    border-radius: 6px;
    border: 2px solid #E8F5E9; /* Light, clean border */
    box-shadow: none; /* Removing heavy shadow */
}

.title {
    text-align: center;
    margin-bottom: 2rem;
    color: #1B5E20;
    font-size: 2rem;
}

.form label {
    display: block;
    margin-top: 1.5rem; /* Increased vertical separation */
    margin-bottom: 0.2rem;
    font-weight: 700;
    color: #1B5E20;
}

/* General Inputs (Text, Select, Textarea) */
input[type="text"], input[type="file"], select, textarea {
    width: 100%;
    margin-top: 0.25rem;
    padding: 0.8rem;
    border: 1px solid #E0E0E0;
    border-radius: 4px;
    transition: border-color 0.2s, box-shadow 0.2s;
    font-size: 1rem;
}

input[type="text"]:focus, select:focus, textarea:focus {
    border-color: #4CAF50;
    box-shadow: 0 0 0 2px #E8F5E9; /* Subtle green focus ring */
    outline: none;
}

textarea {
    resize: vertical;
    min-height: 80px;
}

/* --- Ingredients and Steps Sections --- */
.ingredients, .steps {
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid #E0E0E0;
}

.ingredients h3, .steps h3 {
    color: #4CAF50;
    margin-bottom: 1rem;
    font-size: 1.3rem;
    border-bottom: none;
}

/* Dynamic Ingredient Fields (The repeating input groups) */
.ingredients .ingredients {
    display: flex;
    gap: 1rem;
    margin-bottom: 0.75rem; /* Space between ingredient rows */
}

.ingredients input {
    flex: 1; /* Equal width for Name and Quantity */
    padding: 0.6rem;
}

/* Dynamic Step Fields (The repeating textarea groups) */
.steps .steps {
    margin-bottom: 0.75rem; /* Space between step rows */
}

/* --- Add Button (Light/Subtle) --- */
.add-btn {
    align-self: flex-start;
    margin-top: 0.5rem;
    background: #E8F5E9; /* Very Light Green background */
    color: #1B5E20; /* Dark Green text */
    border: 1px solid #A5D6A7;
    border-radius: 4px;
    padding: 0.5rem 1.2rem;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.2s;
}

.add-btn:hover:not(:disabled) {
    background: #A5D6A7;
    color: #FFFFFF;
}

.add-btn:disabled {
    background: #F5F5F5;
    color: #AAA;
    cursor: not-allowed;
    border-color: #E0E0E0;
}

/* --- Submit Button (Primary Green) --- */
.submit-btn {
    margin-top: 2rem;
    background: #4CAF50; /* Primary Green */
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.9rem 1.5rem;
    cursor: pointer;
    width: 100%;
    font-size: 1.1rem;
    font-weight: 700;
    transition: background 0.2s;
}

.submit-btn:hover:not(:disabled) {
    background: #1B5E20; /* Dark Green Hover */
}

.submit-btn:disabled {
    background: #A5D6A7;
    cursor: not-allowed;
}

/* --- Image Preview --- */
.preview {
    margin-top: 1rem;
    max-width: 100%;
    max-height: 300px;
    object-fit: contain; /* Ensures the whole image is seen */
    border-radius: 4px;
    border: 1px solid #E0E0E0;
    box-shadow: none;
}

.error {
    color: #ff4d4f; /* Soft red for errors */
    text-align: center;
    margin-top: 1rem;
}
</style>
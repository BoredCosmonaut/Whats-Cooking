<script setup>
    import { computed,onMounted, ref} from 'vue'
    import { useRecipe } from '@/composables/useRecipe';
    import recipeCard from '@/components/recipeCard.vue';

    const {searchRecipesApi,getAllIngredients,isLoading} = useRecipe()
    const selectedIngredients = ref([])
    const searchResults = ref([]);
    const ingredientsList = ref([])
    const tempIngredient = ref('');

    onMounted(async () => {
        const response = await getAllIngredients()
        if (response && Array.isArray(response.ingredients)) {
            ingredientsList.value = response.ingredients
        } else {
            ingredientsList.value = []
        }
    })

    const filteredIngredients = computed(() => {
        if (!tempIngredient.value) return ingredientsList.value
        return ingredientsList.value.filter(
            ing => ing && ing.toLowerCase().includes(tempIngredient.value.toLowerCase())
        )
    })

    function addIngredient(ing) {
        const normalized = ing.trim()
        if(normalized && ingredientsList.value.includes(normalized) && !selectedIngredients.value.includes(normalized)){
            selectedIngredients.value.push(normalized)
        }
        tempIngredient.value = ''
    }

    function removeIngredients(index){
        selectedIngredients.value.splice(index,1)
    }

    async function searchRecipes() {
        if(!selectedIngredients.value || selectedIngredients.value.length === 0) {
            alert('Please select at least one ingredient');
            return;
        }
        const res = await searchRecipesApi({ ingredients: selectedIngredients.value });
        console.log('res:', res);
        if(res && res.recipes) searchResults.value = res.recipes;
        else searchResults.value = [];
    }

</script>   

<template>
    <main class="find-recipe">
        <h1>Find Recipe With Ings</h1>
        <section class="search-section">
            <label> Select Ingredients:</label>
            <div class="ingredients-inputs">
                <input 
                    list="ingredients"
                    v-model="tempIngredient"
                    placeholder="Type Ingredient..."
                    @keyup.enter="addIngredient(tempIngredient); console.log(filteredIngredients)"
                />
                <datalist id="ingredients">
                    <option  v-for="(ing,index) in filteredIngredients" :key="index" :value="ing">{{ ing }}</option>
                </datalist>  
                <button @click="addIngredient(tempIngredient)">Add</button> 
            </div>

            <div class="selected-ingredients">
                <span v-for="(ing,index) in selectedIngredients" :key="index" class="selected">
                    {{ ing }} <button @click="removeIngredients(index)">X</button>
                </span>
            </div>

            <button @click="searchRecipes" :disabled="isLoading">
                {{ isLoading ? 'Searching..' : 'Search Recipes' }}
            </button>
        </section>

        <section class="results-section">
            <h2 v-if="searchResults.length">Recipes you can cook</h2>
            <p v-else>No recipes found</p>
            <div class="recipe-cards">
                <recipeCard v-for="recipe in searchResults" :key="recipe.recipe_id" :recipe="recipe" />
            </div>
        </section>
    </main>
</template>

<style scoped>
.recipe-search {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
}

.search-section {
  background: #fff;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ingredient-inputs {
  display: flex;
  gap: 0.5rem;
}

.selected-ingredients {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.selected {
  background: #2c7be5;
  color: #fff;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
}

.selected button {
  background: transparent;
  border: none;
  color: white;
  margin-left: 0.3rem;
  cursor: pointer;
}

.results-section .recipe-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}
</style>
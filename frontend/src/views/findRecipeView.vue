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
/* Hex Codes Used:
#4CAF50 - Primary Green (Accent/Buttons)
#1B5E20 - Dark Green (Text/Headers)
#E8F5E9 - Very Light Green (Background/Hover)
#E0E0E0 - Light Gray (Borders/Dividers)
#FFFFFF - White (Main Background)
*/

.find-recipe {
    max-width: 900px;
    margin: 0 auto;
    padding: 2.5rem 1rem;
    background: #FFFFFF;
}

h1 {
    text-align: left; 
    margin-bottom: 2rem;
    font-size: 2.2rem;
    color: #1B5E20; 
}


.search-section {
    background: none;
    padding: 0; 
    border-radius: 0;
    margin-bottom: 2.5rem;
    box-shadow: none;
    display: flex;
    flex-direction: column;
    gap: 1.5rem; 
}

.search-section label {
    font-weight: 700;
    color: #1B5E20;
    font-size: 1.1rem;
}

.ingredients-inputs {
    display: flex;
    gap: 0.5rem;
}

.ingredients-inputs input {
    flex-grow: 1;
    padding: 0.8rem;
    border: 1px solid #E0E0E0;
    border-radius: 4px;
    font-size: 1rem;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.ingredients-inputs input:focus {
    border-color: #4CAF50;
    box-shadow: 0 0 0 2px #E8F5E9;
    outline: none;
}


.ingredients-inputs button {
    flex-shrink: 0;
    background: #4CAF50;
    color: white;
    border: none;
    padding: 0.8rem 1.2rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.2s;
}

.ingredients-inputs button:hover {
    background: #1B5E20;
}



.selected-ingredients {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.5rem 0;
    min-height: 40px;
}

.selected {
    background: #E8F5E9;
    color: #1B5E20;
    padding: 0.3rem 0.6rem;
    border-radius: 4px;
    font-size: 0.9rem;
    font-weight: 500;
    display: flex;
    align-items: center;
}

.selected button {
    background: transparent;
    border: none;
    color: #1B5E20;
    margin-left: 0.4rem;
    padding: 0;
    line-height: 1;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 700;
    opacity: 0.7;
    transition: opacity 0.2s;
}

.selected button:hover {
    opacity: 1;
}

.search-section > button {
    align-self: flex-start;
    background: #4CAF50; 
    color: white;
    border: none;
    padding: 0.8rem 2rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 700;
    transition: background 0.2s;
}

.search-section > button:hover:not(:disabled) {
    background: #1B5E20;
}

.search-section > button:disabled {
    background: #A5D6A7;
    cursor: not-allowed;
}

/* --- 2. Results Section --- */
.results-section {
    padding-top: 2rem;
    border-top: 1px solid #E0E0E0; 
}

.results-section h2 {
    color: #1B5E20;
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
}

.results-section p {
    color: #666;
    padding: 2rem;
    text-align: center;
    background: #F5F5F5;
    border-radius: 4px;
}

.results-section .recipe-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
}
</style>
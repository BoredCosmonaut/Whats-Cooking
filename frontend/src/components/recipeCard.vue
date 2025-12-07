<template> 
    <div class="recipe-card" :class="{'compact-mode': compact}">
        <div class="image-wrapper">
            <img 
                :src="`http://localhost:8080/images/recipes/${recipe.image_name}`" 
                :alt="recipe.title" 
                class="recipe-image"
            >
        </div>
        
        <div class="card-content">
            <h2 class="recipe-name">{{ recipe.title }}</h2>
            
            <div class="card-details">
                <p class="cooking-time"><span class="label">Time:</span> {{ recipe.cooking_time }} mins</p>
                <p class="difficulty"><span class="label">Difficulty:</span> {{ recipe.difficulty }}</p>
                <p class="category"><span class="label">Category:</span> {{ recipe.category }}</p>
            </div>
            
            <p class="submitted-by">Chef **{{ recipe.submitted_by_username }}**</p>
        </div>
    </div>
</template>

<script setup>
import { defineProps } from 'vue';
    defineProps({
        recipe:{
            type: Object,
            required: true
        },
        compact:{
            type:Boolean,
            default:false
        }
    })
</script>

<style scoped>
/* Hex Codes Used:
#4CAF50 - Primary Green
#1B5E20 - Dark Green
#E0E0E0 - Light Gray
#FFFFFF - White
#E8F5E9 - Very Light Green (for image padding area)
*/

.recipe-card {
    width: 100%;
    height: 100%; 
    background-color: #FFFFFF;
    border: 1px solid #E0E0E0;
    border-radius: 8px;
    overflow: hidden;
    display: flex; 
    flex-direction: column;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.image-wrapper {
    width: 100%;
    height: 70%; 
    overflow: hidden;
    image-resolution: initial;
    background-size: cover;
    background-color: transparent; 
    display: flex;
    justify-content: center; 
    align-items: center;
}

.recipe-image {
    width: 95%;
    height: 95%;
    object-fit: cover; 
    display: block;
    border-radius: 4px;
}

.card-content {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    flex-grow: 1; 
    justify-content: space-between; 
    gap: 0.3rem;
}

.recipe-name {
    font-size: 1.25rem;
    font-weight: bold;
    margin: 0 0 0.5rem 0;
    color: #1B5E20; 
}

.card-details {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin-bottom: 0.5rem;
}

.submitted-by, .difficulty, .category, .cooking-time {
    font-size: 0.85rem;
    color: #666;
    margin: 0;
}

.submitted-by {
    font-size: 0.9rem;
    margin-top: auto; 
    padding-top: 0.5rem;
    border-top: 1px dashed #E0E0E0;
    color: #4CAF50;
    text-align: left; 
}

.label {
    font-weight: bold;
    color: #1B5E20;
}


.recipe-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
}

.recipe-card.compact-mode .image-wrapper {
    height: 400px; 
}

.recipe-card.compact-mode .card-content {
    padding: 0.75rem 1rem;
}

.recipe-card.compact-mode .card-details {
    gap: 0.9rem;
}

.recipe-card.compact-mode .submitted-by {
    padding-top: 0.25rem;
}
</style>
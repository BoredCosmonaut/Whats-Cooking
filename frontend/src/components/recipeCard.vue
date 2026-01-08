<template> 
    <div class="recipe-card" :class="{'compact-mode': compact}">
        <div class="image-wrapper">
            <img 
                :src="`${SUPABASE_URL}/images/recipes/${recipe.image_name}`" 
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
            <div class="submitted-by">
                <img :src="`${SUPABASE_URL}/images/profile/${recipe.user_image_name}`" alt="" class="user-image">
                <span>Chef <strong>{{ recipe.submitted_by_username }}</strong></span>
            </div>
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
//const BASE_URL = process.env.VUE_APP_API_BASE_URL;
const SUPABASE_URL = process.env.VUE_APP_API_SUPABASE_URL;
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

.submitted-by {
    font-size: 0.9rem;
    margin-top: auto; 
    padding-top: 0.8rem; /* Çizgi ile arayı biraz açtık */
    border-top: 1px dashed #E0E0E0;
    color: #666; /* "Chef" yazısı için daha sade bir gri */
    text-align: left; 
    display: flex; /* Resim ve metni yan yana getirmek için */
    align-items: center; /* Dikeyde ortalamak için */
    gap: 8px; /* Resim ve metin arasındaki boşluk */
}

.user-image {
    width: 24px;
    height: 24px;
    border-radius: 50%; /* Tam yuvarlak */
    object-fit: cover;
    border: 1px solid #E8F5E9; /* Çok hafif yeşil çerçeve */
}

.submitted-by strong {
    color: #1B5E20; /* Sadece kullanıcı adı senin koyu yeşilin */
    font-weight: 600;
}
</style>
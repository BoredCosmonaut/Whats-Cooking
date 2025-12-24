<script setup>
import { defineProps } from 'vue';
defineProps({
  clown: {
    type: Object,
    required: true
  },
});

//const BASE_URL = process.env.VUE_APP_API_BASE_URL;
const SUPABASE_URL = process.env.VUE_APP_API_SUPABASE_URL;
</script>

<template>
  <div class="chef-card">
    <img 
      v-if="clown.image_name" 
      :src="`${SUPABASE_URL}/images/profile/${clown.image_name}`" 
      alt="chef image" 
      class="chef-image"
    />
    <div class="chef-info">
      <p class="username">{{ clown.username }}</p>
      <p class="points">{{ clown.points }} pts</p>
    </div>
  </div>
</template>

<style scoped>
.chef-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    background: #FFFFFF;
    border-radius: 4px;
    border: 1px solid #E0E0E0;
    margin: 0.5rem 0;
    width: 220px;
    box-shadow: none; 
    transition: all 0.2s ease;
    cursor: pointer;
}

.chef-card:hover {
    background: #E8F5E9; 
    border-color: #4CAF50;
}

.chef-image {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #4CAF50; 
    flex-shrink: 0;
}

.chef-info {
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.username {
    font-weight: 700;
    font-size: 1rem;
    color: #1B5E20; 
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.points {
    font-size: 0.85rem;
    color: #4CAF50; 
    font-weight: 600;
    margin: 0;
}
</style>

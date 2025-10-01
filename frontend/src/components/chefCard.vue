<script setup>
import { defineProps } from 'vue';

defineProps({
  chef: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <div class="chef-card">
    <img 
      v-if="chef.image_name" 
      :src="`http://localhost:8080/images/profile/${chef.image_name}`" 
      alt="chef image" 
      class="chef-image"
    />
    <div class="chef-info">
      <p class="username">{{ chef.username }}</p>
      <p class="points">{{ chef.points }} pts</p>
    </div>
  </div>
</template>

<style scoped>
.chef-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  margin: 0.5rem;
  background: #fff;
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 220px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.chef-image {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.chef-info {
  display: flex;
  flex-direction: column;
}
.username {
  font-weight: bold;
  font-size: 1.1rem;
}
.points {
  font-size: 0.9rem;
  color: #555;
}
</style>

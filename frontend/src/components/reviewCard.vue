<script setup>
    import { defineProps } from 'vue';
    defineProps({
        review:{
            type:Object,
            required:true
        }
    }) 
</script>

<template>
    <div class="review-card">
        <div class="review-header">
            <div class="reviewer-info">
                <h3 class="username">{{ review.reviewer }}</h3>
                <p class="date">{{ new Date(review.created_at).toLocaleDateString() }}</p>
            </div>
            <div v-if="review.rating" class="rating">
                ⭐ {{ review.rating }}/5
            </div>
        </div>
        <p class="review-text">{{ review.comment }}</p>
        <div v-if="review.images && review.images.length" class="image-gallery">
        <img 
            v-for="image in review.images" 
            :key="image.image_id"
            :src="`http://localhost:8080/images/reviews/${image.image_name}`"
            alt="Review image"
            class="review-image"
        />
        </div>
        <div class="help">
            <p class="h-count">{{ review.helpful_count }}</p>
        </div>
  </div>
</template>

<style scoped>
.review-card {
  background: #fff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  margin-bottom: 1.5rem;
  transition: transform 0.2s ease;
}
.review-card:hover {
  transform: translateY(-2px);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.username {
  font-weight: 600;
  color: #333;
}

.date {
  font-size: 0.9rem;
  color: #777;
}

.rating {
  font-weight: 500;
  color: #f4b400; /* gold star color */
}

.review-text {
  color: #444;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.image-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.review-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ddd;
}
</style>
<script setup>
  import { defineProps, ref, watch } from "vue";
  import { useReview } from "@/composables/useReview";

  const props = defineProps({
    review: {
      type: Object,
      required: true,
    },
    onDeleted:{
      type:Function,
      required:false
    }
  });

  const { markReviewHelpful, unmarkReviewHelpful,removeReview,reportReview } = useReview();
  const userId = Number(localStorage.getItem('userId'));
  const reviewState = ref({ ...props.review });
  console.log('User from composable:', userId)
  watch(
    () => props.review,
    (newVal) => {
      reviewState.value = { ...newVal };
    },
    { immediate: true }
  );

  async function handleHelpfulClick() {
    try {
      let res;
      if (reviewState.value.liked_by_user) {
        res = await unmarkReviewHelpful(reviewState.value.review_id);
      } else {
        res = await markReviewHelpful(reviewState.value.review_id);
      }

      if (res && res.helpful_count !== undefined) {
        reviewState.value = {
          ...reviewState.value,
          helpful_count: res.helpful_count,
          liked_by_user: !reviewState.value.liked_by_user,
        };
      }
    } catch (error) {
      console.error("Error marking helpful:", error);
    }
  }

  async function handleDelete() {
    const confirmDelete = confirm('Are you sure you want to delete this review?');
    if(!confirmDelete) return
    try {
      await removeReview(reviewState.value.review_id)
      alert("✅ Review deleted successfully");
      if (props.onDeleted) props.onDeleted(reviewState.value.review_id);
    } catch (error) {
      alert("Failed to delete review.");
    }
  }

  async function handleReport() {
    const reason = prompt('Please enter a reason for reporting this review:')
    if (!reason) return alert('You must enter a reason to report.')
    try {
      const res = await reportReview(reviewState.value.review_id,reason);
      alert(res.message || 'Review reported!')
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to report review.')
    }
  }

const BASE_URL = process.env.VUE_APP_API_BASE_URL;
</script>

<template>
  <div class="review-card">
    
    <div v-if="reviewState.images && reviewState.images.length" class="review-media-area">
      <img
        :src="`${BASE_URL}/images/reviews/${reviewState.images[0].image_name}`"
        alt="Review image"
        class="review-image-main"
      />
      </div>

    <div class="review-content-area">
        <div class="review-header">
            <h3 class="username">{{ reviewState.reviewer }}</h3>
            <div v-if="reviewState.rating" class="rating">
                ⭐ {{ reviewState.rating }}/5
            </div>
        </div>

        <p class="review-text-compact">{{ reviewState.comment }}</p>

        <div class="actions">
            <button
                @click="handleHelpfulClick"
                :class="['helpful-btn', reviewState.liked_by_user ? 'active' : '']"
            >
                👍 ({{ reviewState.helpful_count ?? 0 }})
            </button>

            <button 
                @click="handleReport" 
                class="report-btn"
            >
                🚩 Report
            </button>


            <button
                v-if="userId && userId === reviewState.user_id"
                class="delete-btn"
                @click="handleDelete"
            >
                🗑 Delete
            </button>
        </div>
        <p class="date">{{ new Date(reviewState.created_at).toLocaleDateString() }}</p>
    </div>
  </div>
</template>

<style scoped>
/* Hex Codes Used:
#4CAF50 - Primary Green
#1B5E20 - Dark Green
#E8F5E9 - Very Light Green
#E0E0E0 - Light Gray
#FFFFFF - White
*/
.review-card {
    display: flex; 
    flex-direction: column; 
    width: 300px; 
    height: 450px;
    background: #FFFFFF;
    border-radius: 8px;
    border: 2px solid #E0E0E0;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    padding: 0; 
    margin-bottom: 0; 
    transition: border-color 0.2s ease;
    overflow: hidden;
    justify-content: center;
    align-items: center;
}

.review-card:hover {
    border-color: #4CAF50;
}


.review-media-area {
    width: 100%;
    height: 60%; 
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    align-items: center;
}

.review-image-main {
    width: 95%; 
    height: 95%;
    object-fit: cover;
    display: block;
}

.review-content-area {
    width: 90%;
    height: 40%;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
}

.review-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    padding-bottom: 0.25rem;
    border-bottom: 1px dashed #E8F5E9;
}

.username {
    font-weight: 700;
    color: #1B5E20; 
    font-size: 1.1rem;
    margin: 0;
}

.date {
    font-size: 0.75rem;
    color: #999;
}

.rating {
    font-weight: 600;
    color: #f4b400; 
}

.review-text-compact {
    color: #444;
    line-height: 1.4;
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
    display: -webkit-box;
    line-clamp: 2; 
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
}

.actions {
    display: flex;
    align-items: center;
    gap: 0.5rem; 
    margin-top: auto;
    padding-top: 0.5rem;
}

.helpful-btn, .report-btn, .delete-btn {
    border: 1px solid #E0E0E0; 
    background: #F9F9F9; 
    padding: 0.3rem 0.6rem; 
    border-radius: 4px; 
    cursor: pointer;
    font-size: 0.75rem; 
    font-weight: 600;
}

.helpful-btn.active {
    background: #4CAF50; 
    color: #FFFFFF;
}

.helpful-btn:hover {
    background: #E8F5E9;
    border-color: #4CAF50;
    color: #1B5E20;
}

.delete-btn {
    background: none;
    color: #ff4d4f;
    border-color: #ff4d4f;
}

.report-btn {
    background: none;
    color: #ff9800;
    border-color: #ff9800;
}

.image-gallery, .review-image {
    display: none; 
}

@media (max-width: 600px) {
    .review-card {
        width: 100%;
        max-width: 100%;
        height: auto;
    }
    .review-media-area {
        height: 200px;  
    }
}
</style>
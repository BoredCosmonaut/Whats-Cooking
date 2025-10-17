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

</script>

<template>
  <div class="review-card">
    <div class="review-header">
      <div class="reviewer-info">
        <h3 class="username">{{ reviewState.reviewer }}</h3>
        <p class="date">{{ new Date(reviewState.created_at).toLocaleDateString() }}</p>
      </div>
      <div v-if="reviewState.rating" class="rating">
        ⭐ {{ reviewState.rating }}/5
      </div>
    </div>

    <p class="review-text">{{ reviewState.comment }}</p>

    <div v-if="reviewState.images && reviewState.images.length" class="image-gallery">
      <img
        v-for="image in reviewState.images"
        :key="image.image_id"
        :src="`http://localhost:8080/images/reviews/${image.image_name}`"
        alt="Review image"
        class="review-image"
      />
    </div>

    <div class="actions">
      <button
        @click="handleHelpfulClick"
        :class="['helpful-btn', reviewState.liked_by_user ? 'active' : '']"
      >
        👍 {{ reviewState.liked_by_user ? "Unlike" : "Like" }}
        ({{ reviewState.helpful_count ?? 0 }})
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
  </div>
</template>

<style scoped>
.review-card {
  background: #fff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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
  color: #f4b400;
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

.actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.helpful-btn {
  background: #f0f0f0;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
}
.helpful-btn.active {
  background: #4caf50;
  color: white;
}
.delete-btn {
  background: #ff4d4f;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
}
.delete-btn:hover {
  background: #d9363e;
}

.report-btn {
  background: #ff9800;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.report-btn:hover {
  background: #e68900;
}

</style>

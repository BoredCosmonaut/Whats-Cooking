<script setup>
  import { defineProps, ref, watch } from "vue";
  import { useReview } from "@/composables/useReview";
  import { toast } from 'vue3-toastify';
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
  const isReporting = ref(false)
  const reportReason = ref("")
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
        toast.success('Unmarked the review')
      } else {
        res = await markReviewHelpful(reviewState.value.review_id);
        toast.success('Marked the review')
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
      toast.error('Error while marking the review')
    }
  }

  async function handleDelete() {
    const confirmDelete = confirm('Are you sure you want to delete this review?');
    if(!confirmDelete) return
    try {
      await removeReview(reviewState.value.review_id)
      toast.success("✅ Review deleted successfully");
      if (props.onDeleted) props.onDeleted(reviewState.value.review_id);
    } catch (error) {
      toast.error("Failed to delete review.");
    }
  }

  async function submitReport() {
    if (!reportReason.value.trim()) return toast.warning('You must enter a reason to report.')
    try {
      const res = await reportReview(reviewState.value.review_id,reportReason.value);
      toast.success(res.message || 'Review reported!')
      isReporting.value = false
      reportReason.value = ""
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to report review.')
    }
  }

//const BASE_URL = process.env.VUE_APP_API_BASE_URL;
const SUPABASE_URL = process.env.VUE_APP_API_SUPABASE_URL;
</script>

<template>
  <div class="review-card">
    
    <div v-if="reviewState.images && reviewState.images.length" class="review-media-area">
      <img
        :src="`${SUPABASE_URL}/images/reviews/${reviewState.images[0].image_name}`"
        alt="Review image"
        class="review-image-main"
      />
      </div>

      <div class="review-content-area">
          <div v-if="isReporting" class="report-overlay">
              <textarea 
                  v-model="reportReason" 
                  placeholder="Why are you reporting? 🌿"
                  class="report-textarea"
              ></textarea>
              <div class="report-actions">
                  <button @click="submitReport" class="confirm-report-btn">Send</button>
                  <button @click="isReporting = false" class="cancel-btn">Cancel</button>
              </div>
          </div>

          <template v-else>
              <div class="review-header">
                  <h3 class="username">{{ reviewState.reviewer }}</h3>
                  <div v-if="reviewState.rating" class="rating">⭐ {{ reviewState.rating }}/5</div>
              </div>
              <p class="review-text-compact">{{ reviewState.comment }}</p>
              <div class="actions">
                  <button @click="handleHelpfulClick" :class="['helpful-btn', reviewState.liked_by_user ? 'active' : '']">👍 ({{ reviewState.helpful_count ?? 0 }})</button>
                  <button @click="isReporting = true" class="report-btn">🚩 Report</button>
                  <button v-if="userId && userId === reviewState.user_id" class="delete-btn" @click="handleDelete">🗑 Delete</button>
              </div>
              <p class="date">{{ new Date(reviewState.created_at).toLocaleDateString() }}</p>
          </template>
      </div>
  </div>
</template>

<style scoped>
/* Palette:
  - Primary Green: #4CAF50
  - Dark Green: #1B5E20
  - Light Background: #E8F5E9
  - Borders/Gray: #E0E0E0
  - White: #FFFFFF
*/

.review-card {
    display: flex; 
    flex-direction: column; 
    width: 300px; 
    /* Metin uzunluğuna göre kartın uzamasını sağlar */
    min-height: 400px;
    height: auto;
    background: #FFFFFF;
    border-radius: 12px; /* Biraz daha yumuşak köşeler minimalist durur */
    border: 1px solid #E0E0E0; /* Daha ince çizgiler kalabalığı azaltır */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); /* Daha hafif bir gölge */
    margin-bottom: 24px; 
    transition: all 0.3s ease;
    overflow: hidden; /* Overlay animasyonu için gerekli */
}

.review-card:hover {
    border-color: #4CAF50;
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.15);
}

.review-media-area {
    width: 100%;
    height: 200px; /* Görsel alanını sabit tutmak düzeni korur */
    background-color: #F9F9F9;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

.review-image-main {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
}

.review-card:hover .review-image-main {
    transform: scale(1.05);
}

.review-content-area {
    position: relative; /* Report overlay için gerekli */
    width: 100%;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}

.review-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
}

.username {
    font-weight: 700;
    color: #1B5E20; 
    font-size: 1rem;
    margin: 0;
}

.rating {
    font-weight: 600;
    color: #f4b400;
    font-size: 0.9rem;
}

/* Metnin tamamını gösteren ana kısım */
.review-text-compact {
    color: #444;
    line-height: 1.6;
    margin: 0.5rem 0 1.5rem 0;
    font-size: 0.95rem;
    word-wrap: break-word; /* Uzun kelimelerin taşmasını önler */
}

.actions {
    display: flex;
    align-items: center;
    gap: 8px; 
    margin-top: auto; /* Butonları her zaman en alta iter */
    padding-top: 1rem;
    border-top: 1px solid #F0F0F0;
}

.helpful-btn, .report-btn, .delete-btn {
    border: 1px solid #E0E0E0; 
    background: #FFFFFF; 
    padding: 6px 10px; 
    border-radius: 6px; 
    cursor: pointer;
    font-size: 0.75rem; 
    font-weight: 600;
    transition: all 0.2s;
}

.helpful-btn.active {
    background: #4CAF50; 
    color: #FFFFFF;
    border-color: #4CAF50;
}

.helpful-btn:not(.active):hover {
    background: #E8F5E9;
    color: #1B5E20;
    border-color: #4CAF50;
}

.delete-btn {
    color: #D32F2F;
    border: none;
}

.report-btn {
    color: #757575;
    border: none;
}

.date {
    font-size: 0.7rem;
    color: #AAA;
    margin-top: 8px;
    align-self: flex-end;
}

/* Raporlama Overlay Tasarımı */
.report-overlay {
    background: #FFFFFF;
    display: flex;
    flex-direction: column;
    gap: 12px;
    animation: fadeIn 0.3s ease;
}

.report-textarea {
    width: 100%;
    min-height: 80px;
    border: 1px solid #E0E0E0;
    border-radius: 6px;
    padding: 10px;
    font-family: inherit;
    font-size: 0.85rem;
    resize: none;
    outline: none;
}

.report-textarea:focus {
    border-color: #4CAF50;
}

.report-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.confirm-report-btn {
    background: #1B5E20;
    color: white;
    border: none;
    padding: 6px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}

.cancel-btn {
    background: #F5F5F5;
    color: #666;
    border: none;
    padding: 6px 16px;
    border-radius: 6px;
    cursor: pointer;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Responsive Düzenleme */
@media (max-width: 600px) {
    .review-card {
        width: 100%;
    }
}
</style>
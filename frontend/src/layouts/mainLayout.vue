<script setup lang="js">
    import { RouterView } from 'vue-router';
    import { onMounted } from 'vue';
    import { useUser } from '@/composables/useUsers';


    const {user,restoreUser} =useUser();
    const userId = localStorage.getItem('userId');

    onMounted(async () => {
      const user_id = localStorage.getItem("userId");
      if (user_id) {
        await restoreUser();
      }
    });


</script>

<template> 
    <div class="main-layout">
        <div class="sidebar" v-if="user && user.info">
            <div class="info">
                <img :src="`http://localhost:8080/images/profile/${user.info.image_name}`" alt="" class="user-image">
                <p class="username">{{ user.info.username }}</p>
                <p class="points">{{ user.points }}</p>               
            </div>
            <nav class="router-links">
                <RouterLink :to="`/home`">Home</RouterLink>
                <RouterLink :to="`/profile/${userId}`">Profile</RouterLink>
                <RouterLink :to="`/submit-recipe`">Submit Recipe</RouterLink>
            </nav>
        </div>
        <main class="main-view">
            <RouterView />
        </main>
    </div>
</template>

<style scoped>
.main-layout {
  display: flex;
  min-height: 100vh; /* full height layout */
  background: #f9f9f9;
}

.sidebar {
  width: 250px;
  background: #f4f4f4;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
}

.user-image {
  width: 120px;
  height: 120px;
  border-radius: 50%; /* circular image */
  object-fit: cover;   /* fills the circle without distortion */
  border: 3px solid #ddd;
  margin-bottom: 1rem;
}

.username {
  font-weight: bold;
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 0.25rem;
}

.points {
  font-size: 1rem;
  color: #666;
}

.router-links {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.main-view {
  flex: 1;
  padding: 2rem;
}
</style>

<template> 
    <div class="main-layout">
        <div class="sidebar" v-if="user && user.info">
            <div class="info">
                <img :src="`http://localhost:8080/images/profile/${user.info.image_name}`" alt="" class="user-image">
                <p class="username">{{ user.info.username }}</p>
                <p class="points-badge">{{ user.points }} Points</p> 
            </div>
            
            <nav class="router-links">
                <hr class="nav-divider"> 
                <RouterLink :to="`/home`" class="nav-link">Home</RouterLink>
                <RouterLink :to="`/profile/${userId}`" class="nav-link">Your Profile</RouterLink>
                <RouterLink :to="`/profile/update/${userId}`" class="nav-link">Update Profile</RouterLink>
                <RouterLink :to="`/submit-recipe`" class="nav-link">Submit Recipe</RouterLink>
                <RouterLink :to="`/favorites`" class="nav-link">Favorites</RouterLink>
                <RouterLink :to="`/recipes/findRecipe`" class="nav-link">What to Cook?</RouterLink>
                </nav>
        </div>
        
        <main class="main-view">
            <RouterView />
        </main>
    </div>
</template>

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

<style scoped>
/* Hex Codes Used:
#4CAF50 - Primary Green
#1B5E20 - Dark Green
#E8F5E9 - Very Light Green
#E0E0E0 - Light Gray
#FFFFFF - White
*/
.main-layout {
  display: flex;
  min-height: 100vh;
  background: #E8F5E9; 
}

.main-view {
  flex: 1;
  padding: 2rem;
  background-color: #FFFFFF; 
}

.sidebar {
  width: 250px;
  background: #FFFFFF;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 10px 5px 5px red;
}

.info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
  width: 100%;
}

.user-image {
  width: 100px; 
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #4CAF50; 
  margin-bottom: 0.75rem;
}

.username {
  font-weight: bold;
  font-size: 1.2rem;
  color: #1B5E20; 
  margin-bottom: 0.5rem;
}

.points-badge {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1B5E20;
  background-color: #E8F5E9;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  border: 1px solid #A5D6A7;
}

.nav-divider {
    width: 90%;
    border: 0;
    border-top: 1px solid #E0E0E0; 
    margin: 1rem 1rem;
}

.router-links {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 90%;
}

.nav-link {
    text-decoration: none;
    padding: 0.75rem 1rem;
    color: #666; 
    font-size: 1rem;
    font-weight: 500;
    width: 100%;
    margin-bottom: 0.25rem;
    border-radius: 4px;
    transition: background-color 0.2s, color 0.2s;
}

.nav-link:hover {
    background-color: #E8F5E9;
    color: #1B5E20; 
}

.router-link-active, .router-link-exact-active {
    background-color: #4CAF50; 
    color: #FFFFFF; 
    font-weight: 700;
    box-shadow: 0 2px 5px rgba(76, 175, 80, 0.2);
}

.router-link-active:hover, .router-link-exact-active:hover {
    background-color: #1B5E20; 
    color: #FFFFFF;
}
</style>
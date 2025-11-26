import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/loginView.vue'
import RegisterView from '@/views/registerView.vue'
import HomeView from '@/views/homeView.vue'
import mainLayout from '@/layouts/mainLayout.vue'
import ProfileView from '@/views/profileView.vue'
import RecipeView from '@/views/recipeView.vue'
import SubmitRecipeView from '@/views/submitRecipeView.vue'
import FavoritesView from '@/views/favoritesView.vue'
import editRecipeView from '@/views/editRecipeView.vue'
import ProfileEditView from '@/views/profileEditView.vue'
import FindRecipeView from '@/views/findRecipeView.vue'
const routes = [
  {
    path:'/login',
    name: 'Login',
    component:LoginView
  },
  {
    path:'/register',
    name:'Register',
    component:RegisterView
  },
  {
    path:'/',
    name:'main',
    component:mainLayout,
    meta: { requiresAuth: true },
    children:[
      {path:'', redirect:'/home'},
      {path:'home',name:'Home', component:HomeView},
      {path:'profile/:userId', name:'Profile', component:ProfileView},
      {path:'/recipe/:recipeId', name:'Recipe', component:RecipeView},
      {path:'/submit-recipe', name:'SubmitRecipe', component:SubmitRecipeView},
      {path:'/favorites',name:'Favorites', component:FavoritesView},
      {path:'/recipe/update/:recipe_id',name:'Update Recipe',component:editRecipeView},
      {path:'/profile/update/:userId',name:'Update Profile', component:ProfileEditView},
      {path:'/recipes/findRecipe',name:'Find recipe', component:FindRecipeView}
    ]
  }
]


const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const isAuth = !!localStorage.getItem('token');
  console.log('Navigating to:', to.fullPath, 'Auth?', isAuth);

  if (to.matched.some(record => record.meta.requiresAuth) && !isAuth) {
    console.log('Blocked, redirecting to login...');
    next('/login');
  } else {
    next();
  }
});


export default router

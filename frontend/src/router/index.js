import { createRouter, createWebHistory } from 'vue-router'
import loginView from '@/views/loginView.vue'
import registerView from '@/views/registerView.vue'
import homeView from '@/views/homeView.vue'
import mainLayout from '@/layouts/mainLayout.vue'
import profileView from '@/views/profileView.vue'
import recipeView from '@/views/recipeView.vue'
import submitRecipeView from '@/views/submitRecipeView.vue'
import favoritesView from '@/views/favoritesView.vue'
import editRecipeView from '@/views/editRecipeView.vue'
import profileEditView from '@/views/profileEditView.vue'
import findRecipeView from '@/views/findRecipeView.vue'
const routes = [
  {
    path:'/login',
    name: 'Login',
    component:loginView
  },
  {
    path:'/register',
    name:'Register',
    component:registerView
  },
  {
    path:'/',
    name:'main',
    component:mainLayout,
    meta: { requiresAuth: true },
    children:[
      {path:'', redirect:'/home'},
      {path:'home',name:'Home', component:homeView},
      {path:'profile/:userId', name:'Profile', component:profileView},
      {path:'/recipe/:recipeId', name:'Recipe', component:recipeView},
      {path:'/submit-recipe', name:'SubmitRecipe', component:submitRecipeView},
      {path:'/favorites',name:'Favorites', component:favoritesView},
      {path:'/recipe/update/:recipe_id',name:'Update Recipe',component:editRecipeView},
      {path:'/profile/update/:userId',name:'Update Profile', component:profileEditView},
      {path:'/recipes/findRecipe',name:'Find recipe', component:findRecipeView}
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

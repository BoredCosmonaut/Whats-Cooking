import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/loginView.vue'
import RegisterView from '@/views/registerView.vue'
import HomeView from '@/views/homeView.vue'
import mainLayout from '@/layouts/mainLayout.vue'
import ProfileView from '@/views/profileView.vue'
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
    children:[
      {path:'', redirect:'/home'},
      {path:'home',name:'Home', component:HomeView},
      {path:'profile/:userId', name:'Profile', component:ProfileView}
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

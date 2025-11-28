<template> 
    <div class="main">
        <div class="login-container"> 
            <input v-model="email" type="email" placeholder="email">
            <input v-model="password" type="password" placeholder="password">
            
            <button @click="handleLogin" :disabled="isLoading">Login</button>
            
            <p v-if="error" class="status-message error-message">{{ error }}</p>
        </div>
    </div>
</template>

<script setup>
import {ref} from 'vue'
import { useAuth } from '@/composables/useAuth';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const {login,error,isLoading} = useAuth();
const router = useRouter();
const logged = ref(false)
async function handleLogin() {
    const result = await login(email.value,password.value);
    if(result) {
        logged.value = true;
        router.push('/home');
    }
}

</script>

<style scoped>
/* Hex Codes Used:
#4CAF50 - Primary Green
#1B5E20 - Dark Green
#E8F5E9 - Very Light Green Background (Corrected)
#E0E0E0 - Light Gray Line (Re-added)
#FFFFFF - White
#D32F2F - Red Error
*/

.main {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100vw;
  background-color: #FFFFFF; /* Main background is white */
  font-family: 'Arial', sans-serif;
  margin: 0;
  padding: 0;
}

/* Green Box for Login Container */
.login-container {
    /* REVERTED TO LIGHT GREEN to maintain visibility and theme consistency */
    background-color: #E8F5E9; 
    border: 1px solid #4CAF50; 
    border-radius: 8px;
    padding: 2.5rem;
    width: 90%;
    max-width: 350px;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

input {
  width: 100%;
  padding: 0.75rem 0.5rem 0.5rem 0.5rem;
  margin-bottom: 1.5rem;
  
  border: none;
  /* RE-ADDED SUBTLE BOTTOM BORDER for visibility and minimalism */
  border-bottom: 2px solid #E0E0E0; 
  /* Set background to transparent so it blends with the light green box */
  background-color: transparent;
  outline: none;
  transition: border-bottom-color 0.3s ease;
  font-size: 1rem;
}

input:focus {
  border-bottom-color: #4CAF50; /* Primary Green focus */
}

button {
  width: 100%;
  padding: 1rem;
  margin-top: 1rem;
  
  background-color: #4CAF50; /* Primary Green */
  color: #FFFFFF; /* White text */
  border: none;
  border-radius: 6px;
  cursor: pointer;
  
  font-weight: bold;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition: background-color 0.3s, opacity 0.3s;
}

button:hover:not(:disabled) {
  background-color: #1B5E20; /* Dark Green hover */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

button:disabled {
  background-color: #A5D6A7; /* Muted Green disabled */
  cursor: not-allowed;
  opacity: 0.8;
}

.status-message {
  margin-top: 1.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  text-align: center;
}

.logged-in {
  color: #1B5E20; /* Dark Green success */
}

.error-message {
  color: #D32F2F; /* Red error */
}
</style>
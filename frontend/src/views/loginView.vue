<template> 
    <div class="main">
        <div class="login-container"> 
            <input v-model="email" type="email" placeholder="email">
            <input v-model="password" type="password" placeholder="password">
            <p>Dont have an account register <router-link to="/register">here</router-link></p>
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
#4CAF50 - Primary Green (Accent)
#1B5E20 - Dark Green (Text/Anchor)
#E8F5E9 - Very Light Green (Subtle Background/Hover)
#E0E0E0 - Light Gray (Input Line)
#FFFFFF - White (Main Background)
#D32F2F - Red Error
*/

.main {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    width: 100vw;
    background-color: #FFFFFF;
    font-family: 'Arial', sans-serif;
    margin: 0;
    padding: 0;
}

.login-container {
    background-color: #FFFFFF; 
    border-radius: 8px;
    padding: 2.5rem;
    padding-top: 0;
    width: 90%;
    max-width: 350px;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05); 
    position: relative; 
}


.login-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 10px; 
    background-color: #4CAF50;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
}


.login-container > * {
    margin-top: 1.5rem;
}

.login-container input:first-of-type {
    margin-top: 2.5rem; 
}



input {
    width: 100%;
    padding: 0.75rem 0 0.5rem 0; 
    margin-bottom: 1.8rem; 
    
    border: none;
    border-bottom: 1px solid #E0E0E0; 
    background-color: transparent;
    outline: none;
    transition: border-bottom-color 0.3s ease;
    font-size: 1rem;
    color: #333; 
}

input:focus {
    border-bottom: 2px solid #1B5E20;
}

/* --- Login Button Styles --- */
button {
    width: 100%;
    padding: 1rem;
    margin-top: 2rem; 
    
    background-color: #4CAF50; 
    color: #FFFFFF;
    border: none;
    border-radius: 4px; 
    cursor: pointer;
    
    font-weight: 700; 
    letter-spacing: 0.08em;
    text-transform: uppercase;
    transition: background-color 0.3s, opacity 0.3s;
}

button:hover:not(:disabled) {
    background-color: #1B5E20; 
    box-shadow: 0 4px 10px rgba(76, 175, 80, 0.3); 
}

button:disabled {
    background-color: #A5D6A7; 
    cursor: not-allowed;
    opacity: 0.8;
}


p {
    font-size: 0.95rem;
    color: #666;
    margin: 0;
    padding-top: 0.5rem;
}

p a {
    color: #1B5E20; 
    font-weight: 600;
    text-decoration: none;
    transition: color 0.2s;
}

p a:hover {
    color: #4CAF50; 
    text-decoration: underline;
}


.status-message {
    margin-top: 1.5rem;
    font-size: 0.95rem;
    font-weight: 500;
    text-align: center;
}

.error-message {
    color: #D32F2F;
}
</style>
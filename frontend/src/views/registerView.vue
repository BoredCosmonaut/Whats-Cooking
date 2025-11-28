<template> 
    <div class="main">
        <form @submit.prevent="handleRegister" class="register-container"> 
            <input v-model="username" type="text" placeholder="Username" required> 
            <input v-model="email" type="email" placeholder="Email" required>
            <input v-model="password" type="password" placeholder="password" required>
            
            <button :disabled="isLoading">Register</button> 
            
            <p v-if="message" class="status-message success-message">{{ message }}</p>
            <p v-if="error" class="status-message error-message"> {{ error }}</p>
        </form>
    </div>
</template>

<script setup>
    import { ref } from 'vue';
    import { useRouter } from 'vue-router';
    import { useAuth } from '@/composables/useAuth';

    const username = ref('');
    const password = ref('');
    const email = ref('');
    const message = ref('');
    const {registerUser,error,isLoading} = useAuth(); 
    const router = useRouter();

    async function handleRegister() {
        const result = await registerUser(username.value,email.value,password.value);
        if(result) {
            message.value = result.message; 
            router.push('/login')
        }
    }

</script> 

<style scoped>
/* Hex Codes Used:
#4CAF50 - Primary Green
#1B5E20 - Dark Green
#E8F5E9 - Very Light Green Background
#E0E0E0 - Light Gray Line
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

/* Green Box for Register Container (Consistent with Login) */
.register-container {
    background-color: #E8F5E9; /* Very Light Green background */
    border: 1px solid #4CAF50; /* Primary Green border */
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
  border-bottom: 2px solid #E0E0E0; /* Subtle bottom line for minimalism */
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

.success-message {
  color: #1B5E20; /* Dark Green success message */
}

.error-message {
  color: #D32F2F; /* Red error */
}
</style>
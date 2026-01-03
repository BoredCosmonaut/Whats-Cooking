<template> 
    <div class="main">
        <form @submit.prevent="handleRegister" class="register-container"> 
            <input v-model="username" type="text" placeholder="Username" required> 
            <input v-model="email" type="email" placeholder="Email" required>
            <input v-model="password" type="password" placeholder="password" required>
            <p>Already have an account login <router-link to="/login">here</router-link></p>
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
    import { toast } from 'vue3-toastify';
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
            toast.success('Kayıt başarılı! Lütfen e-posta adresine gönderilen doğrulama linkine tıkla.');
            router.push('/login')
        }
    }

</script> 

<style scoped>
/* Hex Codes Used:
#4CAF50 - Primary Green (Accent/Strip)
#1B5E20 - Dark Green (Text/Focus)
#E8F5E9 - Very Light Green
#E0E0E0 - Light Gray (Input Line)
#FFFFFF - White (Main Background/Panel)
#D32F2F - Red Error
*/

.main {
    /* Keep centering the form in the viewport */
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

/* Redesigned Registration Container: Minimalist, White Panel */
.register-container {
    /* REMOVED: background-color & border */
    background-color: #FFFFFF; /* Pure white panel */
    border-radius: 8px;
    padding: 2.5rem;
    padding-top: 0; /* Adjust padding to make room for the new header strip */
    width: 90%;
    max-width: 350px;
    display: flex;
    flex-direction: column;
    align-items: center;
    /* Use a softer, modern shadow */
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05); 
    position: relative; 
}

/* NEW: Visual Anchor/Header Strip */
.register-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 10px; /* Slim, solid green strip */
    background-color: #4CAF50;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
}

/* Move content down to avoid collision with the new strip */
.register-container > * {
    margin-top: 1.5rem;
}
/* Adjust first input's margin */
.register-container input:first-of-type {
    margin-top: 2.5rem; 
}

/* --- Input Field Styles --- */
input {
    width: 100%;
    padding: 0.75rem 0 0.5rem 0; 
    margin-bottom: 1.8rem; /* Increased spacing */
    
    border: none;
    border-bottom: 1px solid #E0E0E0; /* Thinner, softer border line */
    background-color: transparent;
    outline: none;
    transition: border-bottom-color 0.3s ease;
    font-size: 1rem;
    color: #333; 
}

input:focus {
    border-bottom: 2px solid #1B5E20; /* Dark Green focus line for impact */
}

/* --- Register Button Styles --- */
button {
    width: 100%;
    padding: 1rem;
    margin-top: 2rem; /* Increased margin for visual separation */
    
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

/* --- Login Link Styling --- */
p {
    font-size: 0.95rem;
    color: #666;
    margin: 0;
    padding-top: 0.5rem;
}

p a {
    color: #1B5E20; /* Dark Green link */
    font-weight: 600;
    text-decoration: none;
    transition: color 0.2s;
}

p a:hover {
    color: #4CAF50; /* Primary Green hover */
    text-decoration: underline;
}

/* --- Status Message Styling --- */
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
    color: #D32F2F;
}
</style>
<template> 
    <div class="main">
        <input v-model="email" type="email" placeholder="email">
        <input v-model="password" type="password" placeholder="password">
        <button @click="handleLogin" :disabled="isLoading">Login</button>
        <p v-if="logged">Logged in</p>
        <p v-if="error">{{ error }}</p>
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
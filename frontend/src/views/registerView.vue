<template> 
    <div class="register-block">
        <input v-model="username" type="username" placeholder="Username" required>
        <input v-model="email" type="email" placeholder="Email" required>
        <input v-model="password" type="password" placeholder="password" required>
        <button @click="handleRegister" :disabled="isLoading">Register</button>
        <p v-if="message">{{ message }}</p>
        <p v-if="error"> {{ error }}</p>
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
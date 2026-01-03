<script setup>
    import {ref, watch,onMounted} from 'vue'
    import { useRoute } from 'vue-router';
    import { useUser } from '@/composables/useUsers';


    const {user,handleImageUpdate,updatePassword,updateProfileInfo,isLoading,fetchUser,error,passwordError} = useUser();
    const route = useRoute();
    const username = ref('');
    const email = ref('');
    const currentPassword = ref('')
    const newPassword = ref('');
    const imageFile = ref(null);
    const imageUrl = ref('')
    const user_id = route.params.userId;
    //const BASE_URL = process.env.VUE_APP_API_BASE_URL;
    watch(
        () => user.value,
        (val) => {
            if(val) {
                username.value = val.username || '';
                email.value = val.email || '';
                currentPassword.value = '';     
                imageUrl.value = val.image_url || '';
            }
        },
        {immediate:true}
    );

    function handleFileChange(e) {
        imageFile.value = e.target.files[0]
        if(imageFile.value) {
            imageUrl.value = URL.createObjectURL(imageFile.value)
        }
    }

    async function submitGeneralInfo() {
        const payload = {username:username.value,email:email.value}
        const res = await updateProfileInfo(user_id,payload)
        if(res) alert('Profile info updated')
    }

    async function submitProfileImage() {
        if(!imageFile.value) {
            alert('please upload an image first')
            return
        }
        const formData = new FormData()
        formData.append('image',imageFile.value);
        const res = await handleImageUpdate(user_id,formData)
        if (res){ 
            alert('Profile picture updated!')
            if (res.url) imageUrl.value = res.url;
        }
    }

    async function submitPassword() {
        if (!newPassword.value) {
            alert('New password is required!')
            return
        }

        const payload = {
            current_password: currentPassword.value,
            newPassword: newPassword.value
        }

        const res = await updatePassword(user_id,payload);
        if(res) alert('Password changed');
    }

    onMounted(async () => {
        const data = await fetchUser(user_id)
        user.value = data.info  
        console.log(user.value)
    })

</script>

<template>
    <div class="profile-layout">
        <main class="profile-setting">
            <h1>Update Profile</h1>
            
            <section class="card">
                <h2>General Info</h2>
                <label>Username</label>
                <input type="text" v-model="username" maxlength="25">
                <label>Email</label>
                <input type="text" v-model="email" maxlength="25">
                <p v-if="error" class="error-message">{{ error }}</p>
                <button @click="submitGeneralInfo" :disabled="isLoading">Update Info</button>
            </section>

            <section class="card">
                <h2>Profile Picture</h2>
                <img :src="imageUrl" class="profile-pic" alt="">
                <input type="file" accept="image/*" @change="handleFileChange">
                <button @click="submitProfileImage" :disabled="isLoading && imageFile && imageFile.size >5*1024*1024" :class="{ 'disabled-btn': imageFile && imageFile.size > 5 * 1024 * 1024 }" >Update Image</button>
            </section>

            <section class="card">
                <h2>Change Password</h2>
                <label>Current Password</label>
                <input type="password" v-model="currentPassword">
                <label>New Password</label>
                <input type="password" v-model="newPassword" maxlength="25">
                <p v-if="passwordError" class="error-message">{{ passwordError }}</p>
                <button @click="submitPassword" :disabled="isLoading">Update Password</button>
            </section>
        </main>
        
        <aside class="profile-sidebar">
            <h3>Help & Security Tips</h3>
            <ul>
                <li>**Username:** Must be unique. Changes might be limited.</li>
                <li>**Email:** Used for account verification and password recovery.</li>
                <li>**Passwords:** Choose a strong password (minimum 12 characters recommended).</li>
                <li>**Image:** Max file size is 5MB. Use a square image for best display results.</li>
            </ul>
        </aside>
    </div>
</template>

<style scoped>
/* Hex Codes Used:
#4CAF50 - Primary Green
#1B5E20 - Dark Green
#E8F5E9 - Very Light Green
#E0E0E0 - Light Gray
#FFFFFF - White
*/

.profile-layout {
    max-width: 1000px; 
    margin: 0 auto;
    display: flex;
    gap: 40px;
    padding: 2.5rem 1rem;
}

.profile-setting {
    width: 600px; 
    flex-shrink: 0;
    margin: 0; 
    background: #FFFFFF;
}

.profile-sidebar {
    flex-grow: 1;
    padding-top: 5rem; 
    color: #333;
}

.profile-sidebar h3 {
    color: #1B5E20; 
    font-size: 1.3rem;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #E8F5E9;
    font-weight: 700;
}

.profile-sidebar ul {
    list-style: none;
    padding: 0;
    margin-bottom: 20px;
}

.profile-sidebar li {
    font-size: 0.95rem;
    line-height: 1.6;
    margin-bottom: 8px;
    border-left: 3px solid #A5D6A7; 
    padding-left: 10px;
}

h1 {
    margin-bottom: 2rem;
    font-size: 2.2rem;
    color: #1B5E20; 
}

.card {
    background: none;
    padding: 1.5rem 0; 
    margin-bottom: 0;
    border-radius: 0;
    box-shadow: none;
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    border-top: 1px solid #E0E0E0; 
}

.profile-setting section:first-of-type {
    border-top: none;
}

.card h2 {
    color: #4CAF50; 
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #E8F5E9; 
    align-self: flex-start; 
}

label {
    font-weight: 600;
    color: #1B5E20; 
    margin-bottom: -0.5rem; 
}

input {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid #E0E0E0;
    border-radius: 4px; 
    font-size: 1rem;
    transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus {
    border-color: #4CAF50;
    box-shadow: 0 0 0 2px #E8F5E9; 
    outline: none;
}

button {
    align-self: flex-start;
    background: #4CAF50; 
    color: white;
    border: none;
    padding: 0.8rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 1rem;
    font-weight: 600;
    transition: background 0.2s;
}

button:hover:not(:disabled) {
    background: #1B5E20; 
}

button:disabled {
    background: #A5D6A7;
    cursor: not-allowed;
}

.profile-pic {
    width: 100px; 
    height: 100px;
    object-fit: cover;
    border-radius: 50%;
    margin: 0.5rem 0 1rem 0;
    border: 3px solid #E8F5E9;
    align-self: flex-start; 
}

.card input[type="file"] {
    border: none;
    padding: 0;
}

.error {
    color: #ff4d4f;
    text-align: left; 
    font-weight: 600;
}

.error-message {
    color: #D32F2F; 
    text-align: left;
    font-weight: 600;
    margin-top: -0.5rem; 
}

.helper-text {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  font-family: sans-serif;
}

.disabled-btn {
  background-color: #e8f5e9 !important; 
  color: #a5d6a7 !important;
  cursor: not-allowed; 
}
</style>
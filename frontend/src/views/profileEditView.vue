<script setup>
    import {ref, watch,onMounted} from 'vue'
    import { useRoute } from 'vue-router';
    import { useUser } from '@/composables/useUsers';


    const {user,handleImageUpdate,updatePassword,updateProfileInfo,isLoading,fetchUser} = useUser();
    const route = useRoute();
    const username = ref('');
    const email = ref('');
    const currentPassword = ref('')
    const newPassword = ref('');
    const imageFile = ref(null);
    const imageUrl = ref('')
    const user_id = route.params.userId;

    watch(
        () => user.value,
        (val) => {
            if(val) {
                username.value = val.username || '';
                email.value = val.email || '';
                currentPassword.value = '';     
                imageUrl.value = val.image_url ? `http://localhost:8080${val.image_url}` : '';
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
        if (res) alert('Profile picture updated!')
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
        console.log(user.value.image_url)
    })

</script>

<template>
    <main class="profile-setting">
        <h1>Update Profile</h1>
            <section class="card">
                <h2>General Info</h2>
                <label>Username</label>
                <input type="text" v-model="username">
                <label>Email</label>
                <input type="text" v-model="email">
                <button @click="submitGeneralInfo" :disabled="isLoading">Update Info</button>
            </section>

            <section class="card">
                <h2>Profile Picture</h2>

                <img :src="imageUrl" class="profile-pic" alt="">

                <input type="file" accept="image/*" @change="handleFileChange">

                <button @click="submitProfileImage" :disabled="isLoading">Update Image</button>
            </section>

            <section class="card">
                <h2>Change Password</h2>
                <label >Current Password</label>
                <input type="password" v-model="currentPassword">
                <label >New Password</label>
                <input type="password" v-model="newPassword">
                <button @click="submitPassword" :disabled="isLoading">Update Password</button>
            </section>

    </main>
</template>

<style scoped>
.profile-settings {
  max-width: 750px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
}

.card {
  background: #fff;
  padding: 1.7rem;
  margin-bottom: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.card h2 {
  margin-bottom: 0.5rem;
}

input {
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

button {
  align-self: flex-start;
  background: #2c7be5;
  color: white;
  border: none;
  padding: 0.7rem 1.1rem;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 0.5rem;
}

button:hover {
  background: #1a5fc4;
}

.profile-pic {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 50%;
  margin-bottom: 1rem;
}

.error {
  color: red;
  text-align: center;
  font-weight: 600;
}
</style>
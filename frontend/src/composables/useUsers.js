import {ref} from 'vue';
import { getUserInfo as userInfoApı } from '@/services/userService';
import { getTopChefs as topUserApı} from '@/services/userService';
import { getClowns as bottomUserApı } from '@/services/userService';
import { updateProfilePicture as profileImageUpdateApi } from '@/services/userService';
import { updatePassword as passwordUpdateApi } from '@/services/userService';
import { updateProfileInfo as profileUpdateApi } from '@/services/userService';
export function useUser() {
    const user = ref(null);
    const isLoading = ref(false);
    const error = ref(null);
    const chefs = ref([])
    const clowns = ref([]);
    async function restoreUser() {
        try {
            const user_id = localStorage.getItem("userId");
            const storedToken = localStorage.getItem("token");
            if (storedToken  && user_id && !user.value) {
            const result = await userInfoApı(user_id);
            if (result?.info) {
                user.value = {
                info: result.info,  
                points: result.points
                };
            }
            console.log("Restored user:", user.value);
            }
        } catch (error) {
            console.error("Failed to restore user:", error);
        }
    }

    async function fetchUser(userId) {
        isLoading.value = true;
        error.value = null;
        try {
            const data = await userInfoApı(userId);
            user.value = data
            return data;
        } catch (error) {
            error.value = error.response?.data?.message || 'Failed to fetch user info'
        } finally {
            isLoading.value = false
        }
    }

    async function fetchTopUsers() {
        error.value = null;
        try {
            const data = await topUserApı();
            chefs.value = data.chefs || []
            return data;
        } catch (error) {
            error.value = error.response?.data?.message || 'Failed to fetch user info'
        }
    }

    async function fetchBottomUsers() {
        error.value = null;
        try {
            const data = await bottomUserApı();
            clowns.value = data.clowns || []
            return data;
        } catch (error) {
            error.value = error.response?.data?.message || 'Failed to fetch user info'
        }
    }

    async function handleImageUpdate(id,file) {
        error.value = null;
        try {
            isLoading.value = true;
            const data = await profileImageUpdateApi(id,file)
            return data
        } catch (error) {
            error.value = error.response?.data?.message || 'Failed to update user info'
        } finally {
            isLoading.value = false
        }
    }

    async function updateProfileInfo(id,data) {
        error.value = null
        try {
            isLoading.value = true
            const res= await profileUpdateApi(id,data)
            return res;
        } catch (error) {
            error.value = error.response?.data?.message || 'Failed to update user info'
        } finally {
            isLoading.value = false
        }
    }

    async function updatePassword(id,data) {
        error.value = null
        try {
            isLoading.value = true
            const res = await passwordUpdateApi(id,data)  
            return res
        } catch (error) {
            error.value = error.response?.data?.message || 'Failed to update user info'
        } finally {
            isLoading.value = false
        }
    }

    return {clowns,chefs,user,isLoading,error,fetchUser,fetchTopUsers,fetchBottomUsers,restoreUser,handleImageUpdate,updateProfileInfo,updatePassword}
}
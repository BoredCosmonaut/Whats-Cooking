import {ref} from 'vue';
import { getUserInfo as userInfoApı } from '@/services/userService';
import { getTopChefs as topUserApı} from '@/services/userService';
import { getHarlots as bottomUserApı } from '@/services/userService';
export function useUser() {
    const user = ref(null);
    const isLoading = ref(false);
    const error = ref(null);
    const chefs = ref([])
    const harlots = ref([]);

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
            harlots.value = data.harlots || []
            return data;
        } catch (error) {
            error.value = error.response?.data?.message || 'Failed to fetch user info'
        }
    }

    return {harlots,chefs,user,isLoading,error,fetchUser,fetchTopUsers,fetchBottomUsers,restoreUser}
}
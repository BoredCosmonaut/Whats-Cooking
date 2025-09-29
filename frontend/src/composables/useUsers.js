import {ref} from 'vue';
import { getUserInfo as userInfoApı } from '@/services/userService';

export function useUser() {
    const user = ref(null);
    const isLoading = ref(false);
    const error = ref(null);

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

    return {user,isLoading,error,fetchUser}
}
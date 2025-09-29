import { ref } from "vue";
import { loginUser as loginAPI, registerUser as registerAPI } from "@/services/userService";

export function useAuth() {
    const user = ref(null);
    const token = ref(null);
    const isLoading = ref(false);
    const error = ref(null);

    async function login(email,password) {
        isLoading.value = true;
        error.value = null;

        try {
            const result = await loginAPI(email,password);
            user.value = result.user;
            token.value = result.token

            localStorage.setItem('token', result.token);
            localStorage.setItem('userId', result.user.id);
            localStorage.setItem('role', result.user.role);
            return result;
        } catch (error) {
            error.value = error.response?.data?.message || 'Login failed';
        } finally {
            isLoading.value = false;
        }

    }

    async function registerUser(username, email, password) {
        isLoading.value = true;
        error.value = null;
        try {
            const result = await registerAPI(username, email, password);
            return result;
        } catch (error) {
            error.value = error.response?.data?.message || 'Registration Failed';
        } finally {
            isLoading.value = false;
        }
    }

    return {user,token,isLoading,error,login,registerUser};
}
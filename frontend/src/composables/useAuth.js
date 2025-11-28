import { ref } from "vue";
import { loginUser as loginAPI, registerUser as registerAPI } from "@/services/userService";

export function useAuth() {
    const user = ref(null);
    const token = ref(null);
    const isLoading = ref(false);
    const error = ref(null);

async function login(email, password) {
    isLoading.value = true;
    error.value = null; 

    try {
        const result = await loginAPI(email, password);
        user.value = result.user;
        token.value = result.token
        
        localStorage.setItem('token', result.token);
        localStorage.setItem('userId', result.user.id);
        localStorage.setItem('role', result.user.role);
        return result;
    } catch (err) {
        if (err.response) {
            if (err.response.status === 429) {
                error.value = 'Too many login attempts. Please wait a moment and try again.';
            } else {
                error.value = err.response.data?.message || 'Login failed due to server error.';
            }
        } else {
            error.value = 'Network error. Please check your connection.';
        }
        
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
            } catch (err) {
                if (err.response) {
                    if (err.response.status === 429) {
                        error.value = 'Too many register attempts. Please wait a moment and try again.';
                    } else {
                        error.value = err.response.data?.message || 'registerion failed due to server error.';
                    }
                } else {
                    error.value = 'Network error. Please check your connection.';
                }
            } finally {
                isLoading.value = false;
            }
    }

    return {user,token,isLoading,error,login,registerUser};
}
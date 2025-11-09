import api from "./api";

export async function loginUser(email,password) {
    const res = await api.post('/users/login', {email,password});
    return res.data;
}

export async function registerUser(username, email, password) {
    const res = await api.post('/users/register', {email,username,password});
    return res.data;
}

export async function getUserInfo(userId) {
    const result = await api.get(`/users/info/${userId}`);
    return result.data;
}

export async function getTopChefs() {
    const result = await api.get(`/users/top`);
    return result.data;
}

export async function getClowns() {
    const result = await api.get(`/users/clowns`);
    return result.data;
}

export async function updateProfileInfo(user_id,data) {
    const result = await api.put(`/users/profile/${user_id}`, data);
    return result.data
}

export async function updateProfilePicture(user_id,data) {
    const result = await api.put(`/users/profileImage/update/${user_id}`,data,{
        headers: { 'Content-Type': 'multipart/form-data' },
    })
    return result.data
}

export async function updatePassword(user_id,data) {
    const result = await api.put(`users/updatePassword/${user_id}`,data)
    return result.data
}

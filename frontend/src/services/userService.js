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

export async function getHarlots() {
    const result = await api.get(`/users/harlots`);
    return result.data;
}

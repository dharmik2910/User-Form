const API_BASE_URL = 'http://localhost:5000/api';

const api = {
    register: (formData) => {
        return fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            body: formData
        }).then(res => res.json());
    },

    login: (email, password) => {
        return fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        }).then(res => res.json());
    },

    getUsers: (token) => {
        return fetch(`${API_BASE_URL}/users`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(res => res.json());
    },

    getCurrentUser: (token) => {
        return fetch(`${API_BASE_URL}/users/profile/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(res => res.json());
    },

    getUserById: (userId, token) => {
        return fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(res => res.json());
    },

    updateUser: (userId, formData, token) => {
        return fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        }).then(res => res.json());
    },

    deleteUser: (userId, token) => {
        return fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }).then(res => res.json());
    }
};

export default api;

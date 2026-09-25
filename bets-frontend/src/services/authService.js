import api from './api';

export const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        const data = response.data;

        // Garante que o token é salvo com a chave 'token' exata
        if (data.token) {
            localStorage.setItem('token', data.token);
        }

        return data;
    },

    logout: () => {
        localStorage.removeItem('token');
    },

    getCurrentToken: () => {
        return localStorage.getItem('token');
    }
};
import api from './api';

// Único ponto que fala com a API de autenticação.
// O token é anexado às requisições pelo interceptor do api.js.
export const authService = {
    login: async (email, password) => {
        const response = await api.post('/api/auth/login', { email, password });
        const token = response.data?.token;

        if (!token) {
            throw new Error('O backend não retornou um token de autenticação.');
        }

        localStorage.setItem('token', token);
        return response.data;
    },

    register: async (userData) => {
        const response = await api.post('/api/register', userData);
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
    },

    getCurrentToken: () => localStorage.getItem('token'),
};

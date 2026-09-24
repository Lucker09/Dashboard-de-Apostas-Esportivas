import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config?.url || '';
        // Correção: removida a anotação :boolean (inválida em JS puro)
        const isAuthRequest = url.includes('/auth/');

        // Se for 401 e NÃO for um pedido de autenticação, limpa a sessão e redireciona
        if (error.response?.status === 401 && !isAuthRequest) {
            localStorage.removeItem('token');

            if (window.location.pathname !== '/login') {
                // Correção: passado diretamente a string '/login'
                window.location.assign('/login');
            }
        }

        return Promise.reject(error);
    }
);

export default api;
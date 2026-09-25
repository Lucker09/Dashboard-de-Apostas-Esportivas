import api from './api';

export const tagsService = {
    listar: async () => {
        const response = await api.get('/tags'); // Sem /api/
        return response.data;
    },
    criar: async (tagData) => {
        const response = await api.post('/tags', tagData);
        return response.data;
    },
    apagar: async (id) => {
        await api.delete(`/tags/${id}`);
    }
};
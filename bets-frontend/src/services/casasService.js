import api from './api';

export const casasService = {
    listar: async () => {
        const response = await api.get('/casas-de-aposta'); // Sem /api/
        return response.data;
    },
    criar: async (casaData) => {
        const response = await api.post('/casas-de-aposta', casaData);
        return response.data;
    },
    apagar: async (id) => {
        await api.delete(`/casas-de-aposta/${id}`);
    }
};
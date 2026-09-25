import api from './api';

export const betsService = {
    getAllBets: async (page = 0, size = 10) => {
        const response = await api.get('/apostas', {
            params: { page, size },
        });
        return response.data;
    },

    createBet: async (betData) => {
        const response = await api.post('/apostas', betData);
        return response.data;
    },

    // Adicionado para suportar a edição/atualização de apostas e tags existentes
    updateBet: async (id, betData) => {
        const response = await api.put(`/apostas/${id}`, betData);
        return response.data;
    },

    liquidateBet: async (id, status, valorResgatado = null) => {
        const payload = { status };

        if (status === 'CASHOUT') {
            payload.valorResgatado = Number(valorResgatado);
        }

        const response = await api.patch(`/apostas/${id}/liquidar`, payload);
        return response.data;
    },

    getBetById: async (id) => {
        const response = await api.get(`/apostas/${id}`);
        return response.data;
    },

    getDashboardMetrics: async () => {
        const response = await api.get('/apostas/dashboard');
        return response.data;
    },
};
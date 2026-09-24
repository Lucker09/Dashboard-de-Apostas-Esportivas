import api from './api';

export const transacaoService = {
    async listarTransacoes() {
        const response = await api.get('/transacoes');
        return response.data;
    },

    async criarTransacao(dados) {
        // dados esperado: { tipo: 'DEPOSITO' ou 'SAQUE', valor: número }
        const response = await api.post('/transacoes', dados);
        return response.data;
    }
};
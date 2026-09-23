import { useCallback, useEffect, useState } from 'react';
import { betsService } from '../services/betsService';
import { formatMoney } from '../utils/format';

const EMPTY_BET = {
    descricao: '',
    odd: '',
    valorApostado: '',
};

export default function BetsTable() {
    const [bets, setBets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cashoutBet, setCashoutBet] = useState(null);
    const [cashoutValue, setCashoutValue] = useState('');
    const [newBet, setNewBet] = useState(EMPTY_BET);

    const getErrorMessage = (err, fallback) => {
        if (err.response?.data?.message) {
            return err.response.data.message;
        }

        if (err.response?.data?.errors) {
            return Object.values(err.response.data.errors).join(', ');
        }

        return fallback;
    };

    const loadBets = useCallback(async (pageNumber) => {
        try {
            setLoading(true);
            setError('');

            const data = await betsService.getAllBets(pageNumber, 10);
            setBets(data.content || []);
            setTotalPages(data.totalPages || 0);
        } catch (err) {
            setError(getErrorMessage(err, 'Não foi possível carregar as apostas.'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // A mudança de página dispara a sincronização com a API.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadBets(page);
    }, [page, loadBets]);

    const handleCreateBet = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError('');

            await betsService.createBet({
                descricao: newBet.descricao.trim(),
                odd: Number(newBet.odd),
                valorApostado: Number(newBet.valorApostado),
            });

            setIsModalOpen(false);
            setNewBet(EMPTY_BET);

            // As apostas mais recentes ficam na primeira página
            if (page !== 0) {
                setPage(0); // o useEffect recarrega a lista
            } else {
                await loadBets(0);
            }
        } catch (err) {
            setError(getErrorMessage(err, 'Não foi possível criar a aposta.'));
        } finally {
            setSaving(false);
        }
    };

    const handleLiquidate = async (id, status, valorResgatado = null) => {
        try {
            setSaving(true);
            setError('');

            await betsService.liquidateBet(id, status, valorResgatado);
            setCashoutBet(null);
            setCashoutValue('');
            await loadBets(page);
        } catch (err) {
            setError(getErrorMessage(err, 'Não foi possível liquidar a aposta.'));
        } finally {
            setSaving(false);
        }
    };

    const handleCashoutSubmit = (e) => {
        e.preventDefault();

        if (!cashoutBet || cashoutValue === '') return;

        handleLiquidate(cashoutBet.id, 'CASHOUT', cashoutValue);
    };

    const getStatusBadge = (status) => {
        const badges = {
            GREEN: ['Green', 'text-green-700 bg-green-100'],
            RED: ['Red', 'text-red-700 bg-red-100'],
            CASHOUT: ['Cash-out', 'text-blue-700 bg-blue-100'],
            ANULADA: ['Anulada', 'text-gray-700 bg-gray-100'],
            PENDENTE: ['Pendente', 'text-yellow-700 bg-yellow-100'],
        };

        const [label, classes] = badges[status] || badges.PENDENTE;

        return (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${classes}`}>
                {label}
            </span>
        );
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Minhas Apostas</h1>
                    <p className="text-sm text-gray-500">
                        Gestão e registo de apostas conectados ao banco de dados.
                    </p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition"
                >
                    + Nova Aposta
                </button>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-100">
                            <th className="p-4">Data</th>
                            <th className="p-4">Descrição</th>
                            <th className="p-4">Odd</th>
                            <th className="p-4">Valor (R$)</th>
                            <th className="p-4">Retorno</th>
                            <th className="p-4">P&L</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-center">Ações</th>
                        </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                        {loading ? (
                            <tr>
                                <td colSpan="8" className="p-6 text-center text-gray-400">
                                    A carregar apostas...
                                </td>
                            </tr>
                        ) : bets.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="p-6 text-center text-gray-400">
                                    Nenhuma aposta registada.
                                </td>
                            </tr>
                        ) : (
                            bets.map((bet) => (
                                <tr key={bet.id} className="hover:bg-gray-50/50 transition">
                                    <td className="p-4 text-gray-500">
                                        {bet.dataCriacao
                                            ? new Date(bet.dataCriacao).toLocaleDateString('pt-BR')
                                            : 'N/A'}
                                    </td>
                                    <td className="p-4 font-medium text-gray-800">{bet.descricao}</td>
                                    <td className="p-4 font-semibold">
                                        {Number(bet.odd).toFixed(2)}
                                    </td>
                                    <td className="p-4">{formatMoney(bet.valorApostado)}</td>
                                    <td className="p-4">
                                        {bet.status === 'PENDENTE' ? '—' : formatMoney(bet.valorResgatado)}
                                    </td>
                                    <td className={`p-4 font-medium ${
                                        Number(bet.profitAndLoss) > 0
                                            ? 'text-green-600'
                                            : Number(bet.profitAndLoss) < 0
                                                ? 'text-red-600'
                                                : 'text-gray-500'
                                    }`}>
                                        {bet.status === 'PENDENTE' ? '—' : formatMoney(bet.profitAndLoss)}
                                    </td>
                                    <td className="p-4">{getStatusBadge(bet.status)}</td>

                                    <td className="p-4 text-center">
                                        {bet.status === 'PENDENTE' ? (
                                            <div className="flex justify-center gap-1.5 flex-wrap">
                                                <button
                                                    disabled={saving}
                                                    onClick={() => handleLiquidate(bet.id, 'GREEN')}
                                                    className="bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded text-xs font-medium disabled:opacity-50"
                                                >
                                                    Green
                                                </button>
                                                <button
                                                    disabled={saving}
                                                    onClick={() => handleLiquidate(bet.id, 'RED')}
                                                    className="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded text-xs font-medium disabled:opacity-50"
                                                >
                                                    Red
                                                </button>
                                                <button
                                                    disabled={saving}
                                                    onClick={() => {
                                                        setCashoutBet(bet);
                                                        setCashoutValue('');
                                                    }}
                                                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded text-xs font-medium disabled:opacity-50"
                                                >
                                                    Cash-out
                                                </button>
                                                <button
                                                    disabled={saving}
                                                    onClick={() => handleLiquidate(bet.id, 'ANULADA')}
                                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-medium disabled:opacity-50"
                                                >
                                                    Anulada
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">Liquidada</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-sm text-gray-600">
                    <span>Página {page + 1} de {totalPages || 1}</span>

                    <div className="space-x-2">
                        <button
                            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                            disabled={page === 0 || loading}
                            className="px-3 py-1 border border-gray-200 rounded bg-white disabled:opacity-50 hover:bg-gray-100 transition"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => setPage((prev) => prev + 1)}
                            disabled={page + 1 >= totalPages || loading}
                            className="px-3 py-1 border border-gray-200 rounded bg-white disabled:opacity-50 hover:bg-gray-100 transition"
                        >
                            Próxima
                        </button>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 space-y-4">
                        <h2 className="text-lg font-bold text-gray-800">Criar Nova Aposta</h2>

                        <form onSubmit={handleCreateBet} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Descrição</label>
                                <input
                                    type="text"
                                    required
                                    value={newBet.descricao}
                                    onChange={(e) => setNewBet({ ...newBet, descricao: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Ex: Flamengo vs Fluminense - Vitória"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Odd</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="1.01"
                                        required
                                        value={newBet.odd}
                                        onChange={(e) => setNewBet({ ...newBet, odd: e.target.value })}
                                        className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Valor Apostado (R$)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        required
                                        value={newBet.valorApostado}
                                        onChange={(e) => setNewBet({ ...newBet, valorApostado: e.target.value })}
                                        className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {saving ? 'Salvando...' : 'Salvar Aposta'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {cashoutBet && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 space-y-4">
                        <h2 className="text-lg font-bold text-gray-800">Registrar Cash-out</h2>
                        <p className="text-sm text-gray-500">
                            Informe quanto foi resgatado nesta aposta.
                        </p>

                        <form onSubmit={handleCashoutSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Valor resgatado (R$)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    required
                                    autoFocus
                                    value={cashoutValue}
                                    onChange={(e) => setCashoutValue(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="75.00"
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCashoutBet(null);
                                        setCashoutValue('');
                                    }}
                                    className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {saving ? 'Salvando...' : 'Confirmar Cash-out'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

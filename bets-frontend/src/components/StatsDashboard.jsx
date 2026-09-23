import { useEffect, useState } from 'react';
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
} from 'recharts';
import { betsService } from '../services/betsService';
import { formatMoney } from '../utils/format';

const INITIAL_STATS = {
    totalApostado: 0,
    totalRetornado: 0,
    profitAndLossTotal: 0,
    roiPercentage: 0,
    winRatePercentage: 0,
    totalApostas: 0,
    apostasGanhas: 0,
    apostasPerdidas: 0,
    apostasCashout: 0,
    apostasAnuladas: 0,
    apostasPendentes: 0,
};

export default function StatsDashboard() {
    const [stats, setStats] = useState(INITIAL_STATS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                setError('');

                const data = await betsService.getDashboardMetrics();
                setStats({ ...INITIAL_STATS, ...data });
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    'Não foi possível carregar as estatísticas.'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // A cor fica junto do status, para não mudar quando alguma fatia é filtrada
    const statusData = [
        { name: 'Ganhas', value: Number(stats.apostasGanhas || 0), color: '#10B981' },
        { name: 'Perdidas', value: Number(stats.apostasPerdidas || 0), color: '#EF4444' },
        { name: 'Cash-out', value: Number(stats.apostasCashout || 0), color: '#3B82F6' },
        { name: 'Anuladas', value: Number(stats.apostasAnuladas || 0), color: '#9CA3AF' },
        { name: 'Pendentes', value: Number(stats.apostasPendentes || 0), color: '#F59E0B' },
    ].filter((item) => item.value > 0);

    if (loading) {
        return (
            <div className="p-6 text-center text-gray-500">
                Carregando estatísticas...
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Painel de Estatísticas</h1>
                <p className="text-sm text-gray-500">
                    Dados calculados diretamente pelo backend.
                </p>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Lucro / Prejuízo</p>
                    <p className={`text-2xl font-semibold ${
                        Number(stats.profitAndLossTotal) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                        {formatMoney(stats.profitAndLossTotal)}
                    </p>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">ROI</p>
                    <p className="text-2xl font-semibold text-blue-600">
                        {Number(stats.roiPercentage || 0).toFixed(2)}%
                    </p>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Taxa de Acerto</p>
                    <p className="text-2xl font-semibold text-purple-600">
                        {Number(stats.winRatePercentage || 0).toFixed(2)}%
                    </p>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Total de Apostas</p>
                    <p className="text-2xl font-semibold text-gray-700">
                        {stats.totalApostas}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-medium text-gray-700 mb-4">
                        Resumo financeiro
                    </h2>

                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Total apostado</span>
                            <strong>{formatMoney(stats.totalApostado)}</strong>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Total retornado</span>
                            <strong>{formatMoney(stats.totalRetornado)}</strong>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Apostas ganhas</span>
                            <strong className="text-green-600">{stats.apostasGanhas}</strong>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Apostas perdidas</span>
                            <strong className="text-red-600">{stats.apostasPerdidas}</strong>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Cash-out</span>
                            <strong className="text-blue-600">{stats.apostasCashout}</strong>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Apostas anuladas</span>
                            <strong className="text-gray-600">{stats.apostasAnuladas}</strong>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Apostas pendentes</span>
                            <strong className="text-yellow-600">{stats.apostasPendentes}</strong>
                        </div>
                        <p className="text-xs text-gray-400">
                            Pendentes e anuladas não entram no total apostado nem no ROI.
                        </p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                    <h2 className="text-lg font-medium text-gray-700 mb-4">
                        Status das Apostas
                    </h2>

                    <div className="h-72 flex items-center justify-center">
                        {statusData.length === 0 ? (
                            <p className="text-gray-400">Ainda não existem apostas suficientes para exibir o gráfico.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label
                                    >
                                        {statusData.map((entry) => (
                                            <Cell key={entry.name} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-medium text-gray-700 mb-2">
                    Evolução do lucro
                </h2>
                <p className="text-sm text-gray-500">
                    O backend atual fornece as métricas consolidadas, mas ainda não possui
                    um endpoint de histórico por data. Por isso, nenhum dado fictício é
                    exibido aqui.
                </p>
            </div>
        </div>
    );
}

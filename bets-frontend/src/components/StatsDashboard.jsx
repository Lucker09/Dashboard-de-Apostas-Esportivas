import React, { useState, useEffect } from 'react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ReferenceLine,
    Cell
} from 'recharts';
import { TrendingUp, TrendingDown, Target, Award, Activity, Clock } from 'lucide-react';
import { betsService } from '../services/betsService';

export default function StatsDashboard() {
    const [timeRange, setTimeRange] = useState('7'); // '7', '30', '365', 'all'
    const [userBets, setUserBets] = useState([]);
    const [loading, setLoading] = useState(true);

    // Carregar dados reais da API ao montar o componente
    useEffect(() => {
        async function fetchDashboardData() {
            try {
                setLoading(true);
                const response = await betsService.getAllBets();
                const apostasLista = Array.isArray(response) ? response : (response.content || []);
                setUserBets(apostasLista);
            } catch (error) {
                console.error("Erro ao carregar apostas para o painel:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, []);

    // 1. Filtrar apostas com base no período selecionado (7 dias, 30 dias, 365 dias ou Todo o período)
    const filterBetsByRange = () => {
        if (timeRange === 'all') return userBets;

        const now = new Date();
        let daysToSubtract = 7;
        if (timeRange === '30') daysToSubtract = 30;
        if (timeRange === '365') daysToSubtract = 365;

        const cutoffDate = new Date();
        cutoffDate.setDate(now.getDate() - daysToSubtract);
        cutoffDate.setHours(0, 0, 0, 0);

        return userBets.filter(bet => {
            if (!bet.dataCriacao) return false;
            const betDate = new Date(bet.dataCriacao);
            return betDate >= cutoffDate;
        });
    };

    const filteredBets = filterBetsByRange();

    // 2. Calcular Métricas Reais Dinamicamente com base no filtro de tempo
    const totalBets = filteredBets.length;

    const finishedBets = filteredBets.filter(b => b.status === 'GREEN' || b.status === 'RED' || b.status === 'CASHOUT');
    const wonBets = finishedBets.filter(b => b.status === 'GREEN');

    const winRate = finishedBets.length > 0 ? ((wonBets.length / finishedBets.length) * 100).toFixed(1) : 0;

    const totalProfit = filteredBets.reduce((acc, b) => acc + (b.profitAndLoss || 0), 0);
    const totalStaked = filteredBets.reduce((acc, b) => acc + (b.valorApostado || 0), 0);
    const roi = totalStaked > 0 ? ((totalProfit / totalStaked) * 100).toFixed(2) : 0;

    // 3. Agrupar dados por dia para os Gráficos
    const getChartData = () => {
        const map = {};

        filteredBets.forEach(b => {
            if (!b.dataCriacao) return;
            const dateStr = new Date(b.dataCriacao).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });

            if (!map[dateStr]) {
                map[dateStr] = { label: dateStr, profit: 0, staked: 0 };
            }

            map[dateStr].profit += (b.profitAndLoss || 0);
            map[dateStr].staked += (b.valorApostado || 0);
        });

        return Object.values(map);
    };

    const chartData = getChartData();
    const totalStakedSum = chartData.reduce((acc, curr) => acc + curr.staked, 0);

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm animate-pulse">A carregar dados estatísticos...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-12">

            {/* Cabeçalho e Seletor de Período */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Painel de Estatísticas</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Desempenho calculado com base nas suas apostas reais</p>
                </div>

                <div className="flex flex-wrap bg-white dark:bg-gray-800 p-1.5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 gap-1">
                    <button
                        onClick={() => setTimeRange('7')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                            timeRange === '7'
                                ? 'bg-blue-600 text-white shadow'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                        7 Dias
                    </button>
                    <button
                        onClick={() => setTimeRange('30')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                            timeRange === '30'
                                ? 'bg-blue-600 text-white shadow'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                        30 Dias
                    </button>
                    <button
                        onClick={() => setTimeRange('365')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                            timeRange === '365'
                                ? 'bg-blue-600 text-white shadow'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                        12 Meses
                    </button>
                    <button
                        onClick={() => setTimeRange('all')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                            timeRange === 'all'
                                ? 'bg-blue-600 text-white shadow'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                        Total
                    </button>
                </div>
            </div>

            {/* Cards de Métricas Clássicas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total de Apostas</p>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{totalBets}</h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${totalProfit >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                        {totalProfit >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Lucro / Prejuízo</p>
                        <h3 className={`text-xl font-bold ${totalProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                            R$ {totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
                        <Target size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">ROI</p>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{roi}%</h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
                        <Award size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Taxa de Acerto</p>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{winRate}%</h3>
                    </div>
                </div>

            </div>

            {/* Grid com os Gráficos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* 1. Gráfico de Ganhos/Perdas */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Ganhos/Perdas</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Retornos menos o valor apostado por período</p>
                        </div>
                        <span className={`text-xl font-bold ${totalProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                            R$ {totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                    </div>

                    <div className="h-64 w-full pt-4">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <XAxis dataKey="label" stroke="#9ca3af" fontSize={12} tickLine={false} />
                                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} />
                                    <ReferenceLine y={0} stroke="#9ca3af" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
                                        formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Lucro/Prejuízo']}
                                    />
                                    <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#34d399' : '#f87171'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                Sem apostas registadas neste período.
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Card de Depósitos Líquidos (Aguardando Feature) */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between relative overflow-hidden">
                    <div>
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Depósitos Líquidos</h2>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                                        <Clock size={10} /> Em breve
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Balanço geral de entradas e saídas</p>
                            </div>
                            <span className="text-xl font-bold text-gray-400 dark:text-gray-500">
                                R$ 0,00
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-6 mt-6 border-t border-gray-100 dark:border-gray-700">
                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl text-center opacity-75">
                            <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Total de Depósitos</span>
                            <span className="text-lg font-semibold text-gray-500 dark:text-gray-400">R$ 0,00</span>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl text-center opacity-75">
                            <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Total de Saques</span>
                            <span className="text-lg font-semibold text-gray-500 dark:text-gray-400">R$ 0,00</span>
                        </div>
                    </div>
                </div>

                {/* 3. Gráfico de Valor Apostado */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4 md:col-span-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Valor Apostado</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Volume total colocado em apostas no período selecionado</p>
                        </div>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                            R$ {totalStakedSum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                    </div>

                    <div className="h-64 w-full pt-4">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <XAxis dataKey="label" stroke="#9ca3af" fontSize={12} tickLine={false} />
                                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
                                        formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Apostado']}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="staked"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                Sem apostas registadas neste período.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
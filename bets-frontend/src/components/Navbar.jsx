import React, { useState, useEffect } from 'react';
import { Wallet, PlusCircle, MinusCircle, LogOut, Sun, Moon, Activity, ListOrdered } from 'lucide-react';
import { userService } from '../services/userService';
import { transacaoService } from '../services/transacaoService';
import { authService } from '../services/authService';

export default function Navbar({ currentTab, setCurrentTab }) {
    const [saldo, setSaldo] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [tipoTransacao, setTipoTransacao] = useState('DEPOSITO'); // 'DEPOSITO' ou 'SAQUE'
    const [valor, setValor] = useState('');
    const [loading, setLoading] = useState(false);

    // Carregar saldo atual do utilizador autenticado
    const carregarSaldo = async () => {
        try {
            const user = await userService.getMyProfile();
            setSaldo(user.saldo || 0);
        } catch (error) {
            console.error("Erro ao carregar saldo do utilizador:", error);
        }
    };

    useEffect(() => {
        carregarSaldo();
    }, []);

    // Enviar transação (Depósito ou Saque)
    const handleSubmitTransacao = async (e) => {
        e.preventDefault();
        if (!valor || Number(valor) <= 0) return;

        try {
            setLoading(true);
            await transacaoService.criarTransacao({
                tipo: tipoTransacao,
                valor: Number(valor)
            });

            alert(`${tipoTransacao === 'DEPOSITO' ? 'Depósito' : 'Saque'} efetuado com sucesso!`);
            setValor('');
            setModalOpen(false);
            carregarSaldo(); // Atualiza o saldo imediatamente na interface
        } catch (error) {
            console.error("Erro ao processar transação:", error);
            alert(error.response?.data?.message || "Erro ao processar transação.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        authService.logout();
        window.location.href = '/login';
    };

    return (
        <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-4 shadow-sm">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">

                {/* Lado Esquerdo: Logótipo e Links de Navegação */}
                <div className="flex items-center gap-8">
                    <span className="font-bold text-xl text-blue-600 dark:text-blue-400">BetsDashboard</span>

                    <nav className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentTab('apostas')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                                currentTab === 'apostas'
                                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            Minhas Apostas
                        </button>
                        <button
                            onClick={() => setCurrentTab('estatisticas')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                                currentTab === 'estatisticas'
                                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            Estatísticas
                        </button>
                    </nav>
                </div>

                {/* Lado Direito: Saldo, Botões de Transação e Logout */}
                <div className="flex items-center gap-3">
                    {/* Contador de Saldo */}
                    <div className="flex items-center gap-2.5 bg-gray-50 dark:bg-gray-900 px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
                        <Wallet className="text-blue-600 dark:text-blue-400" size={18} />
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold leading-none">Saldo</p>
                            <p className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">
                                R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>

                    {/* Botão Depositar */}
                    <button
                        onClick={() => { setTipoTransacao('DEPOSITO'); setModalOpen(true); }}
                        className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition shadow-sm"
                    >
                        <PlusCircle size={14} /> Depositar
                    </button>

                    {/* Botão Sacar */}
                    <button
                        onClick={() => { setTipoTransacao('SAQUE'); setModalOpen(true); }}
                        className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition shadow-sm"
                    >
                        <MinusCircle size={14} /> Sacar
                    </button>

                    {/* Botão Sair */}
                    <button
                        onClick={handleLogout}
                        className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition"
                        title="Terminar Sessão"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>

            {/* Modal de Depósito / Saque */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-xl border border-gray-100 dark:border-gray-700 space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {tipoTransacao === 'DEPOSITO' ? 'Adicionar Depósito' : 'Efetuar Saque'}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Insira o valor que deseja {tipoTransacao === 'DEPOSITO' ? 'depositar na' : 'retirar da'} sua conta.
                        </p>

                        <form onSubmit={handleSubmitTransacao} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Valor (R$)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="1"
                                    required
                                    value={valor}
                                    onChange={(e) => setValor(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold text-white transition ${
                                        tipoTransacao === 'DEPOSITO' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                                    }`}
                                >
                                    {loading ? 'A processar...' : 'Confirmar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </header>
    );
}
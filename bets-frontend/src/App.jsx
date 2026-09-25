import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Wallet, PlusCircle, MinusCircle } from 'lucide-react';
import BetsTable from './components/BetsTable';
import StatsDashboard from './components/StatsDashboard';
import GerirCasasETags from './components/GerirCasasETags'; // <--- Importado aqui (ajuste o caminho se necessário)
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuth } from './context/AuthContext';
import { useDarkMode } from './hooks/useDarkMode';
import { userService } from './services/userService';
import { transacaoService } from './services/transacaoService';

function PrivateRoute({ children }) {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Navigate to="/" replace /> : children;
}

function Navbar() {
    const location = useLocation();
    const { isAuthenticated, logout } = useAuth();
    const [isDarkMode, setIsDarkMode] = useDarkMode();

    const [saldo, setSaldo] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [tipoTransacao, setTipoTransacao] = useState('DEPOSITO');
    const [valor, setValor] = useState('');
    const [loading, setLoading] = useState(false);

    const carregarSaldo = async () => {
        if (!isAuthenticated) return;
        try {
            const user = await userService.getMyProfile();
            setSaldo(user.saldo || 0);
        } catch (error) {
            console.error("Erro ao carregar saldo:", error);
        }
    };

    useEffect(() => {
        if (isAuthenticated && location.pathname !== '/login' && location.pathname !== '/register') {
            carregarSaldo();
        }

        const handleAtualizarSaldo = () => carregarSaldo();
        window.addEventListener('atualizar-saldo', handleAtualizarSaldo);

        return () => {
            window.removeEventListener('atualizar-saldo', handleAtualizarSaldo);
        };
    }, [isAuthenticated, location.pathname]);

    const handleSubmitTransacao = async (e) => {
        e.preventDefault();
        if (!valor || Number(valor) <= 0) return;

        try {
            setLoading(true);
            await transacaoService.criarTransacao({
                tipo: tipoTransacao,
                valor: Number(valor)
            });
            alert(`${tipoTransacao === 'DEPOSITO' ? 'Depósito' : 'Saque'} realizado com sucesso!`);
            setValor('');
            setModalOpen(false);
            carregarSaldo();
        } catch (error) {
            console.error("Erro na transação:", error);
            alert(error.response?.data?.message || "Erro ao processar transação.");
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated || location.pathname === '/login' || location.pathname === '/register') {
        return null;
    }

    return (
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="font-bold text-xl text-blue-600 dark:text-blue-400">BetsDashboard</div>

                <div className="flex items-center gap-4 flex-wrap justify-end">
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

                    {/* Botões Depositar e Sacar */}
                    <button
                        onClick={() => { setTipoTransacao('DEPOSITO'); setModalOpen(true); }}
                        className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition shadow-sm"
                    >
                        <PlusCircle size={14} /> Depositar
                    </button>
                    <button
                        onClick={() => { setTipoTransacao('SAQUE'); setModalOpen(true); }}
                        className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition shadow-sm"
                    >
                        <MinusCircle size={14} /> Sacar
                    </button>

                    {/* Links de Navegação */}
                    <nav className="flex items-center space-x-4 border-l pl-4 border-gray-200 dark:border-gray-700">
                        <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium text-sm transition">
                            Minhas Apostas
                        </Link>
                        <Link to="/gerir" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium text-sm transition">
                            Casas e Tags
                        </Link>
                        <Link to="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium text-sm transition">
                            Estatísticas
                        </Link>
                    </nav>

                    {/* Tema e Sair */}
                    <div className="flex items-center gap-2 border-l pl-4 border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            title="Alternar Tema"
                        >
                            {isDarkMode ? '☀️' : '🌙'}
                        </button>

                        <button
                            onClick={logout}
                            className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition"
                        >
                            Sair
                        </button>
                    </div>
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

export default function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col transition-colors">
                <Navbar />

                <main className="flex-1">
                    <Routes>
                        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

                        <Route
                            path="/"
                            element={
                                <PrivateRoute>
                                    <BetsTable />
                                </PrivateRoute>
                            }
                        />

                        <Route
                            path="/gerir"
                            element={
                                <PrivateRoute>
                                    <GerirCasasETags />
                                </PrivateRoute>
                            }
                        />

                        <Route
                            path="/dashboard"
                            element={
                                <PrivateRoute>
                                    <StatsDashboard />
                                </PrivateRoute>
                            }
                        />

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import BetsTable from './components/BetsTable';
import StatsDashboard from './components/StatsDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuth } from './context/AuthContext';
import { useDarkMode } from './hooks/useDarkMode';

function PrivateRoute({ children }) {
    const { isAuthenticated } = useAuth();

    return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Login/Cadastro: quem já está autenticado é levado direto para a tela principal
function PublicRoute({ children }) {
    const { isAuthenticated } = useAuth();

    return isAuthenticated ? <Navigate to="/" replace /> : children;
}

function Navbar() {
    const location = useLocation();
    const { isAuthenticated, logout } = useAuth();
    const [isDarkMode, setIsDarkMode] = useDarkMode();

    if (!isAuthenticated || location.pathname === '/login' || location.pathname === '/register') {
        return null;
    }

    return (
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <div className="font-bold text-xl text-blue-600 dark:text-blue-400">BetsDashboard</div>

                <nav className="flex items-center space-x-6">
                    <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition">
                        Minhas Apostas
                    </Link>
                    <Link to="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition">
                        Estatísticas
                    </Link>

                    {/* Botão de Alternância de Tema */}
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
                </nav>
            </div>
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
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import BetsTable from './components/BetsTable';
import StatsDashboard from './components/StatsDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuth } from './context/AuthContext';

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

    if (!isAuthenticated || location.pathname === '/login' || location.pathname === '/register') {
        return null;
    }

    return (
        <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <div className="font-bold text-xl text-blue-600">BetsDashboard</div>

                <nav className="flex items-center space-x-6">
                    <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition">
                        Minhas Apostas
                    </Link>
                    <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium transition">
                        Estatísticas
                    </Link>
                    <button
                        onClick={logout}
                        className="text-sm text-red-600 hover:text-red-700 font-medium transition"
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
            <div className="min-h-screen bg-gray-50 flex flex-col">
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

import { createContext, useState, useContext } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => authService.getCurrentToken());
    const [loading] = useState(false);

    const login = async (email, password) => {
        const data = await authService.login(email, password);
        setToken(data.token);
        return data;
    };

    const logout = () => {
        authService.logout();
        setToken(null);
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                isAuthenticated: !!token,
                loading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import StatsDashboard from '../components/StatsDashboard';
import BetsTable from '../components/BetsTable';

export default function Dashboard() {
    const [currentTab, setCurrentTab] = useState('apostas'); // 'apostas' ou 'estatisticas'

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900">
            {/* Navbar com o saldo, botões de depósito/saque e alternância de abas */}
            <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

            {/* Conteúdo dinâmico com base na aba escolhida */}
            <main className="max-w-7xl mx-auto p-6">
                {currentTab === 'apostas' && <BetsTable />}
                {currentTab === 'estatisticas' && <StatsDashboard />}
            </main>
        </div>
    );
}
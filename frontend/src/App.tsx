import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import VaultPage from './pages/VaultPage';

export default function App() {
    const location = useLocation();
    const isHome = location.pathname === '/';

    return (
        <div className="app">
            <Navbar />
            <div className="app-body">
                {!isHome && <Sidebar />}
                <main className={`app-main ${isHome ? 'full' : ''}`}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/vault/:id" element={<VaultPage />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
}

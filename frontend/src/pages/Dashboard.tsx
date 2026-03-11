import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import VaultCard from '../components/cards/VaultCard';
import CreateVaultModal from '../components/modals/CreateVaultModal';
import { getVaults } from '../lib/api';
import { Vault } from '../types';
import { useWallet } from '../context/WalletContext';
import { formatBTCShort } from '../services/wallet';

export default function Dashboard() {
    const { isConnected, balance, opnetConfig } = useWallet();
    const [vaults, setVaults] = useState<Vault[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [filter, setFilter] = useState<'all' | 'daily' | 'weekly'>('all');

    const loadVaults = async () => {
        setLoading(true);
        const data = await getVaults(opnetConfig);
        setVaults(data);
        setLoading(false);
    };

    useEffect(() => {
        loadVaults();
    }, [opnetConfig.provider]);

    const filteredVaults = vaults.filter((v) => {
        if (filter === 'all') return true;
        return v.scheduleType === filter;
    });

    const totalDeposited = vaults.reduce((sum, v) => sum + v.totalDeposited, 0);
    const totalParticipants = vaults.reduce((sum, v) => sum + v.participantCount, 0);

    return (
        <div className="dashboard-page">
            {/* Overview Cards */}
            <motion.div
                className="overview-grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="overview-card">
                    <div className="overview-label">Your Balance</div>
                    <div className="overview-value">{isConnected ? formatBTCShort(balance) : '—'} BTC</div>
                </div>
                <div className="overview-card">
                    <div className="overview-label">Total Deposited</div>
                    <div className="overview-value">{formatBTCShort(totalDeposited)} BTC</div>
                </div>
                <div className="overview-card">
                    <div className="overview-label">Active Vaults</div>
                    <div className="overview-value">{vaults.filter((v) => v.status === 'active').length}</div>
                </div>
                <div className="overview-card">
                    <div className="overview-label">Participants</div>
                    <div className="overview-value">{totalParticipants}</div>
                </div>
            </motion.div>

            {/* Toolbar */}
            <div className="dashboard-toolbar">
                <div>
                    <h2 className="dashboard-title">Active Vaults</h2>
                    <p className="dashboard-subtitle">Join a vault or create your own DCA strategy</p>
                </div>
                <div className="toolbar-actions">
                    {/* Filter Tabs */}
                    <div className="filter-tabs">
                        {(['all', 'daily', 'weekly'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`filter-tab ${filter === f ? 'active' : ''}`}
                            >
                                {f === 'all' ? 'All' : f === 'daily' ? 'Daily' : 'Weekly'}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
                    >
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Create Vault
                    </button>
                </div>
            </div>

            {/* Vault Grid */}
            {loading ? (
                <div className="vault-grid">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="skeleton-card">
                            <div className="skeleton h-5 w-32 mb-3" />
                            <div className="skeleton h-4 w-24 mb-6" />
                            <div className="skeleton h-4 w-full mb-2" />
                            <div className="skeleton h-4 w-full mb-2" />
                            <div className="skeleton h-4 w-3/4" />
                        </div>
                    ))}
                </div>
            ) : filteredVaults.length === 0 ? (
                <div className="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16 opacity-20">
                        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                    </svg>
                    <p>No vaults found</p>
                    <button onClick={() => setShowCreateModal(true)} className="btn-primary px-6 py-2.5 rounded-xl mt-4 text-sm font-semibold">
                        Create First Vault
                    </button>
                </div>
            ) : (
                <motion.div
                    className="vault-grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    {filteredVaults.map((vault, i) => (
                        <motion.div
                            key={vault.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <VaultCard vault={vault} />
                        </motion.div>
                    ))}
                </motion.div>
            )}

            <CreateVaultModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreated={loadVaults}
            />
        </div>
    );
}

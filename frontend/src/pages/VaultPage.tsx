import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getVault, getDCAHistory, getChartData, deposit, withdraw } from '../lib/api';
import { Vault, DCAExecution, ChartDataPoint } from '../types';
import { useWallet } from '../context/WalletContext';
import { formatBTCShort, formatAddress } from '../services/wallet';
import AccumulationChart from '../components/charts/AccumulationChart';

type Tab = 'deposit' | 'withdraw';
type InfoTab = 'details' | 'history' | 'participants';

export default function VaultPage() {
    const { id } = useParams<{ id: string }>();
    const { isConnected, address, opnetConfig } = useWallet();
    const [vault, setVault] = useState<Vault | null>(null);
    const [history, setHistory] = useState<DCAExecution[]>([]);
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<Tab>('deposit');
    const [infoTab, setInfoTab] = useState<InfoTab>('details');
    const [amount, setAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [txStatus, setTxStatus] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        const load = async () => {
            setLoading(true);
            const [v, h, c] = await Promise.all([
                getVault(id, opnetConfig),
                getDCAHistory(id),
                getChartData(id),
            ]);
            setVault(v);
            setHistory(h);
            setChartData(c);
            setLoading(false);
        };
        load();
    }, [id, opnetConfig.provider]);

    const handleDeposit = async () => {
        if (!id || !amount) return;
        setIsSubmitting(true);
        setTxStatus(null);
        try {
            const satoshis = Math.round(parseFloat(amount) * 100_000_000);
            const success = await deposit(id, satoshis, opnetConfig);
            if (success) {
                setTxStatus('Deposit successful!');
                setAmount('');
                const v = await getVault(id, opnetConfig);
                setVault(v);
            }
        } catch (e: any) {
            setTxStatus(`Error: ${e?.message || 'Deposit failed'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleWithdraw = async () => {
        if (!id) return;
        setIsSubmitting(true);
        setTxStatus(null);
        try {
            await withdraw(id, opnetConfig);
            setTxStatus('Withdrawal successful!');
            const v = await getVault(id, opnetConfig);
            setVault(v);
        } catch (e: any) {
            setTxStatus(`Error: ${e?.message || 'Withdraw failed'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="vault-page">
                <div className="vault-page-grid">
                    <div>
                        <div className="card p-6">
                            <div className="skeleton h-8 w-48 mb-4" />
                            <div className="skeleton h-4 w-32 mb-8" />
                            <div className="skeleton h-64 w-full" />
                        </div>
                    </div>
                    <div>
                        <div className="card p-6">
                            <div className="skeleton h-6 w-32 mb-4" />
                            <div className="skeleton h-12 w-full mb-4" />
                            <div className="skeleton h-12 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!vault) {
        return (
            <div className="vault-page">
                <div className="empty-state">
                    <p>Vault not found</p>
                    <Link to="/dashboard" className="btn-primary px-6 py-2.5 rounded-xl mt-4 text-sm">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const blocksUntilExecution = vault.nextExecutionBlock - vault.currentBlock;
    const hoursUntil = Math.max(0, Math.round((blocksUntilExecution * 10) / 60));

    return (
        <div className="vault-page">
            {/* Breadcrumb */}
            <div className="breadcrumb">
                <Link to="/dashboard" className="breadcrumb-link">Dashboard</Link>
                <span className="breadcrumb-sep">/</span>
                <span className="breadcrumb-current">{vault.name}</span>
            </div>

            <div className="vault-page-grid">
                {/* Left Column — Info */}
                <div className="vault-left">
                    {/* Vault Header */}
                    <motion.div
                        className="card p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h1 className="text-xl font-bold text-white">{vault.name}</h1>
                                <p className="text-sm text-[#9ca3af] mt-1">{vault.description}</p>
                            </div>
                            <div className={`vault-status ${vault.status}`}>
                                <span className="vault-status-dot" />
                                {vault.status === 'active' ? 'Active' : 'Paused'}
                            </div>
                        </div>

                        {/* Vault Stats */}
                        <div className="vault-detail-stats">
                            <div className="vault-detail-stat">
                                <span className="label">Total Deposited</span>
                                <span className="value">{formatBTCShort(vault.totalDeposited)} BTC</span>
                            </div>
                            <div className="vault-detail-stat">
                                <span className="label">Total Purchased</span>
                                <span className="value">{formatBTCShort(vault.totalPurchased)} BTC</span>
                            </div>
                            <div className="vault-detail-stat">
                                <span className="label">Schedule</span>
                                <span className="value">{vault.scheduleType === 'daily' ? 'Daily' : 'Weekly'}</span>
                            </div>
                            <div className="vault-detail-stat">
                                <span className="label">Next Execution</span>
                                <span className="value">~{hoursUntil}h</span>
                            </div>
                            <div className="vault-detail-stat">
                                <span className="label">Participants</span>
                                <span className="value">{vault.participantCount}</span>
                            </div>
                            <div className="vault-detail-stat">
                                <span className="label">Duration</span>
                                <span className="value">{vault.duration} {vault.scheduleType === 'daily' ? 'days' : 'weeks'}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Chart */}
                    <motion.div
                        className="card p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h3 className="text-base font-semibold text-white mb-4">BTC Accumulation</h3>
                        <AccumulationChart data={chartData} />
                    </motion.div>

                    {/* Info Tabs */}
                    <motion.div
                        className="card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="info-tabs">
                            {(['details', 'history', 'participants'] as InfoTab[]).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setInfoTab(t)}
                                    className={`info-tab ${infoTab === t ? 'active' : ''}`}
                                >
                                    {t === 'details' ? 'Details' : t === 'history' ? 'DCA History' : 'Participants'}
                                </button>
                            ))}
                        </div>

                        <div className="p-6">
                            {infoTab === 'details' && (
                                <div className="detail-list">
                                    <div className="detail-row">
                                        <span>Creator</span>
                                        <span className="font-mono text-[#F7931A]">{vault.creator}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span>Min Deposit</span>
                                        <span>{formatBTCShort(vault.minDeposit)} BTC</span>
                                    </div>
                                    <div className="detail-row">
                                        <span>Next Block</span>
                                        <span>#{vault.nextExecutionBlock.toLocaleString()}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span>Current Block</span>
                                        <span>#{vault.currentBlock.toLocaleString()}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span>Created</span>
                                        <span>{vault.createdAt}</span>
                                    </div>
                                </div>
                            )}

                            {infoTab === 'history' && (
                                <div className="history-list">
                                    {history.length === 0 ? (
                                        <p className="text-center text-[#6b7280] py-8">No executions yet</p>
                                    ) : (
                                        history.map((exec, i) => (
                                            <div key={i} className="history-row">
                                                <div>
                                                    <span className="history-block">Block #{exec.block.toLocaleString()}</span>
                                                    <span className="history-date">{exec.timestamp}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="history-amount">{formatBTCShort(exec.amount)} BTC</span>
                                                    <span className="history-price">${exec.price.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {infoTab === 'participants' && (
                                <div className="participants-list">
                                    {vault.participants.map((p, i) => (
                                        <div key={i} className="participant-row">
                                            <div className="flex items-center gap-3">
                                                <div className="participant-rank">{i + 1}</div>
                                                <span className="font-mono text-sm">{p.address}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-semibold text-white">{formatBTCShort(p.depositedAmount)} BTC</span>
                                                <span className="text-xs text-[#6b7280] block">{(p.share / 100).toFixed(1)}% share</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Right Column — Action Card (Uniswap-style) */}
                <div className="vault-right">
                    <motion.div
                        className="action-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        {/* Tabs */}
                        <div className="action-tabs">
                            <button
                                onClick={() => setTab('deposit')}
                                className={`action-tab ${tab === 'deposit' ? 'active' : ''}`}
                            >
                                Deposit
                            </button>
                            <button
                                onClick={() => setTab('withdraw')}
                                className={`action-tab ${tab === 'withdraw' ? 'active' : ''}`}
                            >
                                Withdraw
                            </button>
                            {/* Settings icon */}
                            <button className="action-settings">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                                    <circle cx="12" cy="12" r="3" />
                                    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                                </svg>
                            </button>
                        </div>

                        {tab === 'deposit' ? (
                            <>
                                {/* Sell / Input section */}
                                <div className="action-input-box">
                                    <div className="action-input-label">Deposit</div>
                                    <div className="action-input-row">
                                        <input
                                            type="text"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0"
                                            className="action-amount-input"
                                        />
                                        <div className="action-token-btn">
                                            <span className="action-token-icon">₿</span>
                                            BTC
                                            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 opacity-50">
                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="action-input-footer">
                                        <span>${amount ? (parseFloat(amount) * 97500).toFixed(2) : '0'}</span>
                                        <span>Min: {formatBTCShort(vault.minDeposit)} BTC</span>
                                    </div>
                                </div>

                                {/* Arrow */}
                                <div className="action-arrow">
                                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v10.586l3.293-3.293a1 1 0 111.414 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 011.414-1.414L9 14.586V4a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                </div>

                                {/* You Receive */}
                                <div className="action-input-box">
                                    <div className="action-input-label">You Receive (Share)</div>
                                    <div className="action-input-row">
                                        <span className="action-amount-display">
                                            {amount && vault.totalDeposited > 0
                                                ? ((parseFloat(amount) * 100_000_000 / (vault.totalDeposited + parseFloat(amount) * 100_000_000)) * 100).toFixed(2)
                                                : '0'
                                            }%
                                        </span>
                                        <div className="action-token-badge">
                                            Vault Share
                                        </div>
                                    </div>
                                </div>

                                {/* Tx Status */}
                                {txStatus && (
                                    <div className={`text-xs text-center px-3 py-2 rounded-xl mb-2 ${txStatus.startsWith('Error') ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                                        {txStatus}
                                    </div>
                                )}

                                {/* Button */}
                                <button
                                    onClick={handleDeposit}
                                    disabled={!isConnected || !amount || isSubmitting}
                                    className="action-submit"
                                >
                                    {!isConnected
                                        ? 'Connect Wallet'
                                        : !amount
                                        ? 'Enter Amount'
                                        : isSubmitting
                                        ? 'Depositing...'
                                        : 'Deposit BTC'
                                    }
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="action-input-box">
                                    <div className="action-input-label">Your Position</div>
                                    <div className="action-input-row">
                                        <span className="action-amount-display">
                                            {vault.participants.length > 0
                                                ? formatBTCShort(vault.participants[0].depositedAmount)
                                                : '0'
                                            }
                                        </span>
                                        <div className="action-token-btn">
                                            <span className="action-token-icon">₿</span>
                                            BTC
                                        </div>
                                    </div>
                                    <div className="action-input-footer">
                                        <span>Accumulated: {vault.participants.length > 0 ? formatBTCShort(vault.participants[0].btcAccumulated) : '0'} BTC</span>
                                        <span>Share: {vault.participants.length > 0 ? (vault.participants[0].share / 100).toFixed(1) : '0'}%</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleWithdraw}
                                    disabled={!isConnected || isSubmitting}
                                    className="action-submit withdraw"
                                >
                                    {!isConnected
                                        ? 'Connect Wallet'
                                        : isSubmitting
                                        ? 'Withdrawing...'
                                        : 'Withdraw All'
                                    }
                                </button>
                            </>
                        )}
                    </motion.div>

                    {/* Quick Stats */}
                    <motion.div
                        className="card p-5"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h4 className="text-sm font-semibold text-[#9ca3af] mb-4 uppercase tracking-wider">Vault Info</h4>
                        <div className="quick-stats">
                            <div className="quick-stat">
                                <span>APY</span>
                                <span className="text-[#22c55e] font-bold">+{vault.apy}%</span>
                            </div>
                            <div className="quick-stat">
                                <span>Type</span>
                                <span>{vault.scheduleType === 'daily' ? 'Daily' : 'Weekly'}</span>
                            </div>
                            <div className="quick-stat">
                                <span>Block</span>
                                <span>#{vault.currentBlock.toLocaleString()}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

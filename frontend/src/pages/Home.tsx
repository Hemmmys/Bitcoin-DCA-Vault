import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWallet } from '../context/WalletContext';

export default function Home() {
    const { isConnected, connect, isConnecting } = useWallet();

    return (
        <div className="home-page">
            {/* Hero */}
            <motion.div
                className="hero"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="hero-badge">
                    <span className="hero-badge-dot" />
                    OP_NET Testnet
                </div>

                <h1 className="hero-title">
                    Dollar Cost Average
                    <br />
                    <span className="text-orange">Bitcoin</span> on L1
                </h1>

                <p className="hero-subtitle">
                    Deposit BTC into shared vaults. The smart contract automatically executes
                    purchases on a daily or weekly schedule. Stack sats with zero effort.
                </p>

                <div className="hero-actions">
                    {isConnected ? (
                        <Link to="/dashboard" className="btn-primary hero-btn">
                            Open Dashboard
                            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </Link>
                    ) : (
                        <button onClick={connect} disabled={isConnecting} className="btn-primary hero-btn">
                            {isConnecting ? 'Connecting...' : 'Connect OP_Wallet'}
                        </button>
                    )}
                    <a
                        href="https://docs.opnet.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline hero-btn"
                    >
                        Learn More
                    </a>
                </div>
            </motion.div>

            {/* Features */}
            <motion.div
                className="features-grid"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <div className="feature-card">
                    <div className="feature-icon orange">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                        </svg>
                    </div>
                    <h3>Shared Vaults</h3>
                    <p>Join vaults with other users. Each participant owns a share proportional to their deposits.</p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon green">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                        </svg>
                    </div>
                    <h3>Automatic DCA</h3>
                    <p>Smart contract executes purchases on schedule. Daily or weekly — you choose the frequency.</p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon blue">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0110 0v4" />
                        </svg>
                    </div>
                    <h3>Bitcoin L1</h3>
                    <p>Secured directly on Bitcoin Layer 1 via OP_NET. No bridges, no wrapping, pure BTC.</p>
                </div>
            </motion.div>

            {/* Stats */}
            <motion.div
                className="stats-row"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
            >
                <div className="stat-box">
                    <span className="stat-value">4.6 BTC</span>
                    <span className="stat-label">Total Deposited</span>
                </div>
                <div className="stat-box">
                    <span className="stat-value">4</span>
                    <span className="stat-label">Active Vaults</span>
                </div>
                <div className="stat-box">
                    <span className="stat-value">25</span>
                    <span className="stat-label">Participants</span>
                </div>
                <div className="stat-box">
                    <span className="stat-value">~14.2%</span>
                    <span className="stat-label">Avg APY</span>
                </div>
            </motion.div>
        </div>
    );
}

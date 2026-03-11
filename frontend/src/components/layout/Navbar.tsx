import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../../context/WalletContext';

const NAV_ITEMS = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Vaults', path: '/dashboard' },
    { label: 'Portfolio', path: '/dashboard' },
];

export default function Navbar() {
    const { isConnected, formattedAddress, connect, disconnect, isConnecting } = useWallet();
    const location = useLocation();

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                {/* Logo */}
                <Link to="/" className="navbar-logo">
                    <div className="logo-icon">₿</div>
                    <span className="logo-text">
                        BTC DCA Vault
                    </span>
                </Link>

                {/* Nav Items */}
                <div className="navbar-links">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={`navbar-link ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>

                {/* Search */}
                <div className="navbar-search-wrap">
                    <svg className="navbar-search-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search vaults..."
                        className="navbar-search"
                    />
                    <span className="navbar-search-shortcut">/</span>
                </div>

                {/* Wallet */}
                {isConnected ? (
                    <button onClick={disconnect} className="wallet-btn connected">
                        <span className="wallet-dot" />
                        {formattedAddress}
                    </button>
                ) : (
                    <button onClick={connect} disabled={isConnecting} className="wallet-btn">
                        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                    </button>
                )}
            </div>
        </nav>
    );
}

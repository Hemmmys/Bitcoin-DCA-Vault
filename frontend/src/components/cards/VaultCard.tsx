import React from 'react';
import { Link } from 'react-router-dom';
import { Vault } from '../../types';
import { formatBTCShort } from '../../services/wallet';

interface VaultCardProps {
    vault: Vault;
}

export default function VaultCard({ vault }: VaultCardProps) {
    const blocksUntilExecution = vault.nextExecutionBlock - vault.currentBlock;
    const hoursUntil = Math.max(0, Math.round((blocksUntilExecution * 10) / 60));

    return (
        <Link to={`/vault/${vault.id}`} className="vault-card group">
            {/* Header */}
            <div className="vault-card-header">
                <div className="flex items-center gap-3">
                    <div className="vault-card-icon">
                        ₿
                    </div>
                    <div>
                        <h3 className="vault-card-title">{vault.name}</h3>
                        <div className="vault-card-schedule">
                            {vault.scheduleType === 'daily' ? 'Daily' : 'Weekly'} DCA
                        </div>
                    </div>
                </div>
                <div className={`vault-status ${vault.status}`}>
                    <span className="vault-status-dot" />
                    {vault.status === 'active' ? 'Active' : 'Paused'}
                </div>
            </div>

            {/* Stats */}
            <div className="vault-card-stats">
                <div className="vault-stat">
                    <span className="vault-stat-label">Total Deposited</span>
                    <span className="vault-stat-value">{formatBTCShort(vault.totalDeposited)} BTC</span>
                </div>
                <div className="vault-stat">
                    <span className="vault-stat-label">Purchased</span>
                    <span className="vault-stat-value">{formatBTCShort(vault.totalPurchased)} BTC</span>
                </div>
                <div className="vault-stat">
                    <span className="vault-stat-label">Participants</span>
                    <span className="vault-stat-value">{vault.participantCount}</span>
                </div>
            </div>

            {/* Footer */}
            <div className="vault-card-footer">
                <div className="vault-next-exec">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 opacity-50">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span>Next in ~{hoursUntil}h</span>
                </div>
                <div className="vault-apy">
                    +{vault.apy}%
                </div>
            </div>
        </Link>
    );
}

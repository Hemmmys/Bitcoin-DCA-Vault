import { Vault, DCAExecution, ChartDataPoint, UserPosition } from '../types';
import { MOCK_VAULTS, MOCK_DCA_HISTORY, MOCK_CHART_DATA } from './mock-data';
import {
    getVaults as getVaultsOnChain,
    getVaultById as getVaultOnChain,
    getUserPositionOnChain,
    createVaultOnChain,
    depositToVault,
    withdrawFromVault,
    type OpnetConfig,
} from './opnet';

// Re-export OpnetConfig for consumers
export type { OpnetConfig };

// ──────── Vaults ────────

export async function getVaults(config?: OpnetConfig): Promise<Vault[]> {
    // Try on-chain first
    if (config?.provider) {
        try {
            const onChainVaults = await getVaultsOnChain(config);
            if (onChainVaults.length > 0) {
                return onChainVaults;
            }
        } catch (e) {
            console.error('On-chain getVaults failed, using mock:', e);
        }
    }
    return MOCK_VAULTS;
}

export async function getVault(id: string, config?: OpnetConfig): Promise<Vault | null> {
    // Try on-chain first
    if (config?.provider) {
        try {
            const vaultId = parseInt(id);
            if (!isNaN(vaultId)) {
                const vault = await getVaultOnChain(config, vaultId);
                if (vault) return vault;
            }
        } catch (e) {
            console.error('On-chain getVault failed, using mock:', e);
        }
    }
    return MOCK_VAULTS.find((v) => v.id === id) || null;
}

export async function createVault(
    data: {
        name: string;
        description: string;
        scheduleType: 'daily' | 'weekly';
        duration: number;
        minDeposit: number;
    },
    config?: OpnetConfig,
): Promise<Vault | null> {
    // Try on-chain
    if (config?.provider && config?.signer) {
        try {
            const scheduleTypeNum = data.scheduleType === 'daily' ? 0 : 1;
            const txId = await createVaultOnChain(config, scheduleTypeNum, data.duration, data.minDeposit);
            console.log('Vault created on-chain, tx:', txId);
            return {
                id: 'pending',
                ...data,
                totalDeposited: 0,
                totalPurchased: 0,
                nextExecutionBlock: 0,
                currentBlock: 0,
                participants: [],
                participantCount: 0,
                creator: config.walletAddress || '',
                status: 'active',
                apy: 0,
                createdAt: new Date().toISOString().split('T')[0],
            };
        } catch (e) {
            console.error('On-chain createVault failed:', e);
            throw e;
        }
    }
    // Mock fallback
    const newVault: Vault = {
        id: String(MOCK_VAULTS.length + 1),
        ...data,
        totalDeposited: 0,
        totalPurchased: 0,
        nextExecutionBlock: 850144,
        currentBlock: 850000,
        participants: [],
        participantCount: 0,
        creator: 'bc1q...you',
        status: 'active',
        apy: 0,
        createdAt: new Date().toISOString().split('T')[0],
    };
    MOCK_VAULTS.push(newVault);
    return newVault;
}

// ──────── Deposits / Withdrawals ────────

export async function deposit(
    vaultId: string,
    amount: number,
    config?: OpnetConfig,
): Promise<boolean> {
    if (config?.provider && config?.signer) {
        try {
            const id = parseInt(vaultId);
            if (!isNaN(id)) {
                const txId = await depositToVault(config, id, BigInt(amount));
                console.log('Deposited on-chain, tx:', txId);
                return true;
            }
        } catch (e) {
            console.error('On-chain deposit failed:', e);
            throw e;
        }
    }
    // Mock fallback
    const vault = MOCK_VAULTS.find((v) => v.id === vaultId);
    if (vault) {
        vault.totalDeposited += amount;
        vault.participantCount += 1;
    }
    return true;
}

export async function withdraw(
    vaultId: string,
    config?: OpnetConfig,
): Promise<boolean> {
    if (config?.provider && config?.signer) {
        try {
            const id = parseInt(vaultId);
            if (!isNaN(id)) {
                const txId = await withdrawFromVault(config, id);
                console.log('Withdrawn on-chain, tx:', txId);
                return true;
            }
        } catch (e) {
            console.error('On-chain withdraw failed:', e);
            throw e;
        }
    }
    return true;
}

// ──────── DCA History ────────

export async function getDCAHistory(vaultId: string): Promise<DCAExecution[]> {
    return MOCK_DCA_HISTORY[vaultId] || [];
}

// ──────── Chart Data ────────

export async function getChartData(vaultId: string): Promise<ChartDataPoint[]> {
    return MOCK_CHART_DATA[vaultId] || [];
}

// ──────── User Position ────────

export async function getUserPosition(
    vaultId: string,
    userAddress: string,
    config?: OpnetConfig,
): Promise<UserPosition | null> {
    // Try on-chain
    if (config?.provider && userAddress) {
        try {
            const id = parseInt(vaultId);
            if (!isNaN(id)) {
                const pos = await getUserPositionOnChain(config, id, userAddress);
                if (pos) return pos;
            }
        } catch (e) {
            console.error('On-chain getUserPosition failed:', e);
        }
    }
    // Mock fallback
    const vault = MOCK_VAULTS.find((v) => v.id === vaultId);
    if (!vault || vault.participants.length === 0) return null;
    const p = vault.participants[0];
    return {
        vaultId,
        depositedAmount: p.depositedAmount,
        share: p.share,
        btcAccumulated: p.btcAccumulated,
        pnl: ((p.btcAccumulated - p.depositedAmount) / p.depositedAmount) * 100,
    };
}

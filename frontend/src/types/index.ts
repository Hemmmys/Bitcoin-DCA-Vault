export type ScheduleType = 'daily' | 'weekly';
export type VaultStatus = 'active' | 'paused' | 'completed';

export interface Vault {
    id: string;
    name: string;
    description: string;
    scheduleType: ScheduleType;
    duration: number;
    minDeposit: number;
    totalDeposited: number;
    totalPurchased: number;
    nextExecutionBlock: number;
    currentBlock: number;
    participants: Participant[];
    participantCount: number;
    creator: string;
    status: VaultStatus;
    apy: number;
    createdAt: string;
}

export interface Participant {
    address: string;
    depositedAmount: number;
    share: number;
    btcAccumulated: number;
}

export interface DCAExecution {
    block: number;
    amount: number;
    price: number;
    timestamp: string;
}

export interface ChartDataPoint {
    block: number;
    date: string;
    vaultBTC: number;
    userBTC: number;
}

export interface UserPosition {
    vaultId: string;
    depositedAmount: number;
    share: number;
    btcAccumulated: number;
    pnl: number;
}

import { getDCAVaultContract, CONTRACT_ADDRESS, DEFAULT_FEE_RATE, MAX_SAT_PER_TX } from '@/services/contract';
import { Address } from '@btc-vision/transaction';
import type { Vault, UserPosition } from '@/types';

export interface OpnetConfig {
    provider: any;
    network: any;
    publicKey?: string;
    signer?: any;
    walletAddress?: string;
}

function getContract(config: OpnetConfig) {
    return getDCAVaultContract(config.provider, config.network, config.publicKey);
}

async function sendTx(config: OpnetConfig, simulation: any) {
    if (!config.signer) throw new Error('Wallet signer not available. Reconnect wallet.');
    return await simulation.sendTransaction({
        signer: config.signer,
        refundTo: config.walletAddress,
        maximumAllowedSatToSpend: MAX_SAT_PER_TX,
        feeRate: DEFAULT_FEE_RATE,
        network: config.network,
    } as any);
}

// ──────── Vault Names (metadata for display, on-chain vaults only have numeric params) ────────
const VAULT_NAMES: Record<number, { name: string; description: string }> = {
    0: { name: 'BTC Daily Accumulator', description: 'Daily DCA strategy for consistent Bitcoin accumulation' },
    1: { name: 'Weekly Stack Sats', description: 'Weekly DCA vault optimized for long-term hodlers' },
    2: { name: 'Diamond Hands DCA', description: 'Premium daily DCA vault for serious accumulators' },
    3: { name: "Satoshi's Strategy", description: 'Conservative weekly DCA vault with lower risk profile' },
};

function getVaultMeta(id: number) {
    return VAULT_NAMES[id] || { name: `DCA Vault #${id}`, description: 'Bitcoin DCA vault on OP_NET' };
}

// ──────── Read Functions ────────

export async function getVaultCount(config: OpnetConfig): Promise<number> {
    if (!CONTRACT_ADDRESS || !config.provider) return 0;
    try {
        const contract = getContract(config);
        const result = await contract.getVaultCount();
        console.log('getVaultCount raw:', JSON.stringify(result, (_, v) => typeof v === 'bigint' ? v.toString() : v));
        const props = result?.properties as any;
        return Number(props?.count?.toString() || '0');
    } catch (e) {
        console.error('getVaultCount error:', e);
        return 0;
    }
}

export async function getVaults(config: OpnetConfig): Promise<Vault[]> {
    const vaults: Vault[] = [];
    let onChainCount = 0;

    if (CONTRACT_ADDRESS && config.provider) {
        try {
            onChainCount = await getVaultCount(config);
        } catch { /* ignore */ }
    }

    for (let i = 0; i < onChainCount; i++) {
        const meta = getVaultMeta(i);
        let scheduleType = 0;
        let duration = 0;
        let minDeposit = 0;
        let totalDeposited = 0;
        let totalPurchased = 0;
        let nextExecutionBlock = 0;

        try {
            const contract = getContract(config);
            const result = await contract.getVault(BigInt(i));
            console.log(`getVault(${i}) raw:`, JSON.stringify(result, (_, v) => typeof v === 'bigint' ? v.toString() : v));
            const props = result?.properties as any;
            scheduleType = Number(props?.scheduleType?.toString() || '0');
            duration = Number(props?.duration?.toString() || '0');
            minDeposit = Number(props?.minDeposit?.toString() || '0');
            totalDeposited = Number(props?.totalDeposited?.toString() || '0');
            totalPurchased = Number(props?.totalPurchased?.toString() || '0');
            nextExecutionBlock = Number(props?.nextExecutionBlock?.toString() || '0');
        } catch (e) {
            console.error(`getVault(${i}) error:`, e);
        }

        vaults.push({
            id: String(i),
            name: meta.name,
            description: meta.description,
            scheduleType: scheduleType === 0 ? 'daily' : 'weekly',
            duration,
            minDeposit,
            totalDeposited,
            totalPurchased,
            nextExecutionBlock,
            currentBlock: 0,
            participants: [],
            participantCount: 0,
            creator: '',
            status: 'active',
            apy: 0,
            createdAt: '',
        });
    }

    return vaults;
}

export async function getVaultById(config: OpnetConfig, vaultId: number): Promise<Vault | null> {
    if (!CONTRACT_ADDRESS || !config.provider) return null;
    try {
        const contract = getContract(config);
        const result = await contract.getVault(BigInt(vaultId));
        console.log(`getVault(${vaultId}) raw:`, JSON.stringify(result, (_, v) => typeof v === 'bigint' ? v.toString() : v));
        const props = result?.properties as any;

        const meta = getVaultMeta(vaultId);
        const scheduleType = Number(props?.scheduleType?.toString() || '0');

        return {
            id: String(vaultId),
            name: meta.name,
            description: meta.description,
            scheduleType: scheduleType === 0 ? 'daily' : 'weekly',
            duration: Number(props?.duration?.toString() || '0'),
            minDeposit: Number(props?.minDeposit?.toString() || '0'),
            totalDeposited: Number(props?.totalDeposited?.toString() || '0'),
            totalPurchased: Number(props?.totalPurchased?.toString() || '0'),
            nextExecutionBlock: Number(props?.nextExecutionBlock?.toString() || '0'),
            currentBlock: 0,
            participants: [],
            participantCount: 0,
            creator: '',
            status: 'active',
            apy: 0,
            createdAt: '',
        };
    } catch (e) {
        console.error(`getVaultById(${vaultId}) error:`, e);
        return null;
    }
}

export async function getUserPositionOnChain(
    config: OpnetConfig,
    vaultId: number,
    userAddress: string
): Promise<UserPosition | null> {
    if (!CONTRACT_ADDRESS || !userAddress || !config.provider) return null;
    try {
        const contract = getContract(config);
        const addr = Address.fromString(userAddress);
        const result = await contract.getUserPosition(BigInt(vaultId), addr as any);
        console.log('getUserPosition raw:', JSON.stringify(result, (_, v) => typeof v === 'bigint' ? v.toString() : v));

        const props = result?.properties as any;
        const deposited = Number(props?.deposited?.toString() || '0');
        const share = Number(props?.share?.toString() || '0');

        return {
            vaultId: String(vaultId),
            depositedAmount: deposited,
            share,
            btcAccumulated: deposited,
            pnl: 0,
        };
    } catch (e) {
        console.error('getUserPosition error:', e);
        return null;
    }
}

// ──────── Write Functions ────────

export async function createVaultOnChain(
    config: OpnetConfig,
    scheduleType: number,
    duration: number,
    minDeposit: number,
): Promise<string> {
    const contract = getContract(config);
    console.log('createVault params:', { scheduleType, duration, minDeposit });
    const sim = await contract.createVault(BigInt(scheduleType), BigInt(duration), BigInt(minDeposit));
    console.log('createVault simulation:', JSON.stringify(sim, (_, v) => typeof v === 'bigint' ? v.toString() : v));
    if ('revert' in sim && (sim as any).revert) throw new Error((sim as any).revert);
    if ((sim as any).error) throw new Error((sim as any).error);
    const tx = await sendTx(config, sim);
    console.log('createVault tx result:', JSON.stringify(tx, (_, v) => typeof v === 'bigint' ? v.toString() : v));
    return tx?.transactionId || tx?.toString() || 'sent';
}

export async function depositToVault(
    config: OpnetConfig,
    vaultId: number,
    amountSats: bigint,
): Promise<string> {
    const contract = getContract(config);
    console.log('deposit params:', { vaultId, amountSats: amountSats.toString() });
    const sim = await contract.deposit(BigInt(vaultId), amountSats);
    console.log('deposit simulation:', JSON.stringify(sim, (_, v) => typeof v === 'bigint' ? v.toString() : v));
    if ('revert' in sim && (sim as any).revert) throw new Error((sim as any).revert);
    if ((sim as any).error) throw new Error((sim as any).error);
    const tx = await sendTx(config, sim);
    console.log('deposit tx result:', JSON.stringify(tx, (_, v) => typeof v === 'bigint' ? v.toString() : v));
    return tx?.transactionId || tx?.toString() || 'sent';
}

export async function withdrawFromVault(
    config: OpnetConfig,
    vaultId: number,
): Promise<string> {
    const contract = getContract(config);
    console.log('withdraw params:', { vaultId });
    const sim = await contract.withdraw(BigInt(vaultId));
    console.log('withdraw simulation:', JSON.stringify(sim, (_, v) => typeof v === 'bigint' ? v.toString() : v));
    if ('revert' in sim && (sim as any).revert) throw new Error((sim as any).revert);
    if ((sim as any).error) throw new Error((sim as any).error);
    const tx = await sendTx(config, sim);
    console.log('withdraw tx result:', JSON.stringify(tx, (_, v) => typeof v === 'bigint' ? v.toString() : v));
    return tx?.transactionId || tx?.toString() || 'sent';
}

export async function executeDCAOnChain(
    config: OpnetConfig,
    vaultId: number,
): Promise<string> {
    const contract = getContract(config);
    console.log('executeDCA params:', { vaultId });
    const sim = await contract.executeDCA(BigInt(vaultId));
    console.log('executeDCA simulation:', JSON.stringify(sim, (_, v) => typeof v === 'bigint' ? v.toString() : v));
    if ('revert' in sim && (sim as any).revert) throw new Error((sim as any).revert);
    if ((sim as any).error) throw new Error((sim as any).error);
    const tx = await sendTx(config, sim);
    console.log('executeDCA tx result:', JSON.stringify(tx, (_, v) => typeof v === 'bigint' ? v.toString() : v));
    return tx?.transactionId || tx?.toString() || 'sent';
}

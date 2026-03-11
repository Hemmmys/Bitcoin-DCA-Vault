import { ABIDataTypes, BitcoinAbiTypes, getContract, type CallResult, type BaseContractProperties, type BitcoinInterfaceAbi } from 'opnet';
import { Address } from '@btc-vision/transaction';

export const DCA_VAULT_ABI: BitcoinInterfaceAbi = [
    // Write methods
    {
        name: 'createVault',
        inputs: [
            { name: 'scheduleType', type: ABIDataTypes.UINT256 },
            { name: 'duration', type: ABIDataTypes.UINT256 },
            { name: 'minDeposit', type: ABIDataTypes.UINT256 },
        ],
        outputs: [{ name: 'vaultId', type: ABIDataTypes.UINT256 }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'deposit',
        inputs: [
            { name: 'vaultId', type: ABIDataTypes.UINT256 },
            { name: 'amount', type: ABIDataTypes.UINT256 },
        ],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'executeDCA',
        inputs: [{ name: 'vaultId', type: ABIDataTypes.UINT256 }],
        outputs: [{ name: 'purchaseAmount', type: ABIDataTypes.UINT256 }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'withdraw',
        inputs: [{ name: 'vaultId', type: ABIDataTypes.UINT256 }],
        outputs: [{ name: 'amount', type: ABIDataTypes.UINT256 }],
        type: BitcoinAbiTypes.Function,
    },
    // Read methods
    {
        name: 'getVaultCount',
        constant: true,
        inputs: [],
        outputs: [{ name: 'count', type: ABIDataTypes.UINT256 }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'getVault',
        constant: true,
        inputs: [{ name: 'vaultId', type: ABIDataTypes.UINT256 }],
        outputs: [
            { name: 'scheduleType', type: ABIDataTypes.UINT256 },
            { name: 'duration', type: ABIDataTypes.UINT256 },
            { name: 'minDeposit', type: ABIDataTypes.UINT256 },
            { name: 'totalDeposited', type: ABIDataTypes.UINT256 },
            { name: 'totalPurchased', type: ABIDataTypes.UINT256 },
            { name: 'nextExecutionBlock', type: ABIDataTypes.UINT256 },
        ],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'getUserPosition',
        constant: true,
        inputs: [
            { name: 'vaultId', type: ABIDataTypes.UINT256 },
            { name: 'user', type: ABIDataTypes.ADDRESS },
        ],
        outputs: [
            { name: 'deposited', type: ABIDataTypes.UINT256 },
            { name: 'share', type: ABIDataTypes.UINT256 },
        ],
        type: BitcoinAbiTypes.Function,
    },
];

export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';
export const DEFAULT_FEE_RATE = 10;
export const MAX_SAT_PER_TX = BigInt(100000);

export interface IDCAVaultContract extends BaseContractProperties {
    createVault(scheduleType: bigint, duration: bigint, minDeposit: bigint): Promise<CallResult>;
    deposit(vaultId: bigint, amount: bigint): Promise<CallResult>;
    executeDCA(vaultId: bigint): Promise<CallResult>;
    withdraw(vaultId: bigint): Promise<CallResult>;
    getVaultCount(): Promise<CallResult>;
    getVault(vaultId: bigint): Promise<CallResult>;
    getUserPosition(vaultId: bigint, user: string): Promise<CallResult>;
}

export function getDCAVaultContract(provider: any, network: any, senderPubKey?: string): IDCAVaultContract {
    if (!CONTRACT_ADDRESS) {
        throw new Error('Contract address not configured. Set VITE_CONTRACT_ADDRESS in .env');
    }

    let senderAddress: Address | undefined;
    if (senderPubKey) {
        try {
            senderAddress = Address.fromString(senderPubKey);
        } catch {
            senderAddress = undefined;
        }
    }

    return getContract<IDCAVaultContract>(
        CONTRACT_ADDRESS,
        DCA_VAULT_ABI,
        provider,
        network,
        senderAddress,
    );
}

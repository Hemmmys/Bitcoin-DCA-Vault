import { ABIDataTypes, BitcoinAbiTypes, OP_NET_ABI } from 'opnet';

export const DCAVaultEvents = [];

export const DCAVaultAbi = [
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
    {
        name: 'getVaultCount',
        inputs: [],
        outputs: [{ name: 'count', type: ABIDataTypes.UINT256 }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'getVault',
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
    ...DCAVaultEvents,
    ...OP_NET_ABI,
];

export default DCAVaultAbi;

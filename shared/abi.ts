/**
 * BTC DCA Vault — Contract ABI
 *
 * Contract Address (Testnet): update after deployment
 */

export const DCA_VAULT_ADDRESS = '0x0000000000000000000000000000000000000000';

export const DCA_VAULT_ABI = [
    {
        name: 'createVault',
        inputs: [
            { name: 'scheduleType', type: 'uint8' },
            { name: 'duration', type: 'uint64' },
            { name: 'minDeposit', type: 'uint256' },
        ],
        outputs: [{ name: 'vaultId', type: 'uint64' }],
    },
    {
        name: 'deposit',
        inputs: [{ name: 'vaultId', type: 'uint64' }],
        outputs: [{ name: 'success', type: 'bool' }],
    },
    {
        name: 'executeDCA',
        inputs: [{ name: 'vaultId', type: 'uint64' }],
        outputs: [{ name: 'success', type: 'bool' }],
    },
    {
        name: 'withdraw',
        inputs: [{ name: 'vaultId', type: 'uint64' }],
        outputs: [{ name: 'success', type: 'bool' }],
    },
    {
        name: 'getVault',
        inputs: [{ name: 'vaultId', type: 'uint64' }],
        outputs: [
            { name: 'vaultId', type: 'uint64' },
            { name: 'scheduleType', type: 'uint8' },
            { name: 'duration', type: 'uint64' },
            { name: 'minDeposit', type: 'uint256' },
            { name: 'totalDeposited', type: 'uint256' },
            { name: 'totalPurchased', type: 'uint256' },
            { name: 'nextExecutionBlock', type: 'uint64' },
            { name: 'participantCount', type: 'uint32' },
            { name: 'creator', type: 'address' },
            { name: 'active', type: 'bool' },
        ],
    },
    {
        name: 'getUserPosition',
        inputs: [
            { name: 'vaultId', type: 'uint64' },
            { name: 'userAddress', type: 'address' },
        ],
        outputs: [
            { name: 'address', type: 'address' },
            { name: 'depositedAmount', type: 'uint256' },
            { name: 'share', type: 'uint256' },
            { name: 'btcAccumulated', type: 'uint256' },
        ],
    },
    {
        name: 'getVaultCount',
        inputs: [],
        outputs: [{ name: 'count', type: 'uint64' }],
    },
];

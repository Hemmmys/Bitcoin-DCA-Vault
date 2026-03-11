import {
    ABIRegistry,
    defineMethod,
    defineStruct,
} from '@btc-vision/btc-runtime/runtime';

export const VAULT_STRUCT = defineStruct('Vault', [
    { name: 'vaultId', type: 'u64' },
    { name: 'scheduleType', type: 'u8' },
    { name: 'duration', type: 'u64' },
    { name: 'minDeposit', type: 'u256' },
    { name: 'totalDeposited', type: 'u256' },
    { name: 'totalPurchased', type: 'u256' },
    { name: 'nextExecutionBlock', type: 'u64' },
    { name: 'participantCount', type: 'u32' },
    { name: 'creator', type: 'address' },
    { name: 'active', type: 'bool' },
]);

export const PARTICIPANT_STRUCT = defineStruct('Participant', [
    { name: 'address', type: 'address' },
    { name: 'depositedAmount', type: 'u256' },
    { name: 'share', type: 'u256' },
    { name: 'btcAccumulated', type: 'u256' },
]);

export interface IDCAVault {
    createVault(scheduleType: u8, duration: u64, minDeposit: u256): u64;
    deposit(vaultId: u64): bool;
    executeDCA(vaultId: u64): bool;
    withdraw(vaultId: u64): bool;
    getVault(vaultId: u64): VAULT_STRUCT;
    getUserPosition(vaultId: u64, userAddress: address): PARTICIPANT_STRUCT;
}

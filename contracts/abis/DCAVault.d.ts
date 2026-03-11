import { Address, AddressMap, ExtendedAddressMap, SchnorrSignature } from '@btc-vision/transaction';
import { CallResult, OPNetEvent, IOP_NETContract } from 'opnet';

// ------------------------------------------------------------------
// Event Definitions
// ------------------------------------------------------------------

// ------------------------------------------------------------------
// Call Results
// ------------------------------------------------------------------

/**
 * @description Represents the result of the createVault function call.
 */
export type CreateVault = CallResult<
    {
        vaultId: bigint;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the deposit function call.
 */
export type Deposit = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the executeDCA function call.
 */
export type ExecuteDCA = CallResult<
    {
        purchaseAmount: bigint;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the withdraw function call.
 */
export type Withdraw = CallResult<
    {
        amount: bigint;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the getVaultCount function call.
 */
export type GetVaultCount = CallResult<
    {
        count: bigint;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the getVault function call.
 */
export type GetVault = CallResult<
    {
        scheduleType: bigint;
        duration: bigint;
        minDeposit: bigint;
        totalDeposited: bigint;
        totalPurchased: bigint;
        nextExecutionBlock: bigint;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the getUserPosition function call.
 */
export type GetUserPosition = CallResult<
    {
        deposited: bigint;
        share: bigint;
    },
    OPNetEvent<never>[]
>;

// ------------------------------------------------------------------
// IDCAVault
// ------------------------------------------------------------------
export interface IDCAVault extends IOP_NETContract {
    createVault(scheduleType: bigint, duration: bigint, minDeposit: bigint): Promise<CreateVault>;
    deposit(vaultId: bigint, amount: bigint): Promise<Deposit>;
    executeDCA(vaultId: bigint): Promise<ExecuteDCA>;
    withdraw(vaultId: bigint): Promise<Withdraw>;
    getVaultCount(): Promise<GetVaultCount>;
    getVault(vaultId: bigint): Promise<GetVault>;
    getUserPosition(vaultId: bigint, user: Address): Promise<GetUserPosition>;
}

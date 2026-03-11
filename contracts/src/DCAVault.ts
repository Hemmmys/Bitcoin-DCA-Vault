import { u256 } from '@btc-vision/as-bignum/assembly';
import {
    OP_NET,
    Blockchain,
    Address,
    Calldata,
    BytesWriter,
    StoredU256,
    StoredU256Array,
    StoredAddressArray,
    SafeMath,
    Revert,
    EMPTY_POINTER,
} from '@btc-vision/btc-runtime/runtime';

/**
 * DCAVault — Bitcoin L1 Dollar Cost Averaging Vault
 *
 * Users deposit BTC into shared vaults. The contract periodically
 * executes DCA purchases on a daily/weekly schedule (by block height).
 *
 * Each vault has:
 *   - scheduleType (0=daily, 1=weekly)
 *   - duration (number of periods)
 *   - minDeposit
 *   - totalDeposited, totalPurchased
 *   - nextExecutionBlock
 *   - per-user deposit tracking via parallel arrays
 *
 * Up to MAX_VAULTS vaults. Vault IDs start at 0.
 */

const ZERO: u256 = u256.Zero;
const ONE: u256 = u256.One;
const HUNDRED: u256 = u256.fromU64(100);
const FIVE: u256 = u256.fromU64(5);
const MAX_VAULTS: i32 = 10;
const BLOCKS_PER_DAY: u256 = u256.fromU64(144);
const BLOCKS_PER_WEEK: u256 = u256.fromU64(1008);
const SCHEDULE_DAILY: u256 = u256.fromU64(0);
const SHARE_PRECISION: u256 = u256.fromU64(10000); // basis points

@final
export class DCAVault extends OP_NET {
    // ====== Global Storage ======
    private vaultCountPointer: u16 = Blockchain.nextPointer;

    private vaultCountStore: StoredU256 = new StoredU256(this.vaultCountPointer, EMPTY_POINTER);

    // ====== Per-Vault Storage ======
    // Each vault uses 9 pointers:
    //  0 = scheduleType
    //  1 = duration
    //  2 = minDeposit
    //  3 = totalDeposited
    //  4 = totalPurchased
    //  5 = nextExecutionBlock
    //  6 = depositorCount
    //  7 = depositorAddresses (array)
    //  8 = depositorAmounts (array)

    private vaultBasePointer: u16 = Blockchain.nextPointer;

    // Reserve 89 more pointers (MAX_VAULTS * 9 = 90 total)
    private _r01: u16 = Blockchain.nextPointer;
    private _r02: u16 = Blockchain.nextPointer;
    private _r03: u16 = Blockchain.nextPointer;
    private _r04: u16 = Blockchain.nextPointer;
    private _r05: u16 = Blockchain.nextPointer;
    private _r06: u16 = Blockchain.nextPointer;
    private _r07: u16 = Blockchain.nextPointer;
    private _r08: u16 = Blockchain.nextPointer;
    private _r09: u16 = Blockchain.nextPointer;
    private _r10: u16 = Blockchain.nextPointer;
    private _r11: u16 = Blockchain.nextPointer;
    private _r12: u16 = Blockchain.nextPointer;
    private _r13: u16 = Blockchain.nextPointer;
    private _r14: u16 = Blockchain.nextPointer;
    private _r15: u16 = Blockchain.nextPointer;
    private _r16: u16 = Blockchain.nextPointer;
    private _r17: u16 = Blockchain.nextPointer;
    private _r18: u16 = Blockchain.nextPointer;
    private _r19: u16 = Blockchain.nextPointer;
    private _r20: u16 = Blockchain.nextPointer;
    private _r21: u16 = Blockchain.nextPointer;
    private _r22: u16 = Blockchain.nextPointer;
    private _r23: u16 = Blockchain.nextPointer;
    private _r24: u16 = Blockchain.nextPointer;
    private _r25: u16 = Blockchain.nextPointer;
    private _r26: u16 = Blockchain.nextPointer;
    private _r27: u16 = Blockchain.nextPointer;
    private _r28: u16 = Blockchain.nextPointer;
    private _r29: u16 = Blockchain.nextPointer;
    private _r30: u16 = Blockchain.nextPointer;
    private _r31: u16 = Blockchain.nextPointer;
    private _r32: u16 = Blockchain.nextPointer;
    private _r33: u16 = Blockchain.nextPointer;
    private _r34: u16 = Blockchain.nextPointer;
    private _r35: u16 = Blockchain.nextPointer;
    private _r36: u16 = Blockchain.nextPointer;
    private _r37: u16 = Blockchain.nextPointer;
    private _r38: u16 = Blockchain.nextPointer;
    private _r39: u16 = Blockchain.nextPointer;
    private _r40: u16 = Blockchain.nextPointer;
    private _r41: u16 = Blockchain.nextPointer;
    private _r42: u16 = Blockchain.nextPointer;
    private _r43: u16 = Blockchain.nextPointer;
    private _r44: u16 = Blockchain.nextPointer;
    private _r45: u16 = Blockchain.nextPointer;
    private _r46: u16 = Blockchain.nextPointer;
    private _r47: u16 = Blockchain.nextPointer;
    private _r48: u16 = Blockchain.nextPointer;
    private _r49: u16 = Blockchain.nextPointer;
    private _r50: u16 = Blockchain.nextPointer;
    private _r51: u16 = Blockchain.nextPointer;
    private _r52: u16 = Blockchain.nextPointer;
    private _r53: u16 = Blockchain.nextPointer;
    private _r54: u16 = Blockchain.nextPointer;
    private _r55: u16 = Blockchain.nextPointer;
    private _r56: u16 = Blockchain.nextPointer;
    private _r57: u16 = Blockchain.nextPointer;
    private _r58: u16 = Blockchain.nextPointer;
    private _r59: u16 = Blockchain.nextPointer;
    private _r60: u16 = Blockchain.nextPointer;
    private _r61: u16 = Blockchain.nextPointer;
    private _r62: u16 = Blockchain.nextPointer;
    private _r63: u16 = Blockchain.nextPointer;
    private _r64: u16 = Blockchain.nextPointer;
    private _r65: u16 = Blockchain.nextPointer;
    private _r66: u16 = Blockchain.nextPointer;
    private _r67: u16 = Blockchain.nextPointer;
    private _r68: u16 = Blockchain.nextPointer;
    private _r69: u16 = Blockchain.nextPointer;
    private _r70: u16 = Blockchain.nextPointer;
    private _r71: u16 = Blockchain.nextPointer;
    private _r72: u16 = Blockchain.nextPointer;
    private _r73: u16 = Blockchain.nextPointer;
    private _r74: u16 = Blockchain.nextPointer;
    private _r75: u16 = Blockchain.nextPointer;
    private _r76: u16 = Blockchain.nextPointer;
    private _r77: u16 = Blockchain.nextPointer;
    private _r78: u16 = Blockchain.nextPointer;
    private _r79: u16 = Blockchain.nextPointer;
    private _r80: u16 = Blockchain.nextPointer;
    private _r81: u16 = Blockchain.nextPointer;
    private _r82: u16 = Blockchain.nextPointer;
    private _r83: u16 = Blockchain.nextPointer;
    private _r84: u16 = Blockchain.nextPointer;
    private _r85: u16 = Blockchain.nextPointer;
    private _r86: u16 = Blockchain.nextPointer;
    private _r87: u16 = Blockchain.nextPointer;
    private _r88: u16 = Blockchain.nextPointer;
    private _r89: u16 = Blockchain.nextPointer;

    public constructor() {
        super();
    }

    public override onDeployment(_calldata: Calldata): void {
        this.vaultCountStore.value = ZERO;
    }

    // ====== Pointer helpers ======

    private vaultPointer(vaultId: i32, offset: i32): u16 {
        return (this.vaultBasePointer + (vaultId * 9) + offset) as u16;
    }

    private getScheduleType(vaultId: i32): StoredU256 {
        return new StoredU256(this.vaultPointer(vaultId, 0), EMPTY_POINTER);
    }

    private getDuration(vaultId: i32): StoredU256 {
        return new StoredU256(this.vaultPointer(vaultId, 1), EMPTY_POINTER);
    }

    private getMinDeposit(vaultId: i32): StoredU256 {
        return new StoredU256(this.vaultPointer(vaultId, 2), EMPTY_POINTER);
    }

    private getTotalDeposited(vaultId: i32): StoredU256 {
        return new StoredU256(this.vaultPointer(vaultId, 3), EMPTY_POINTER);
    }

    private getTotalPurchased(vaultId: i32): StoredU256 {
        return new StoredU256(this.vaultPointer(vaultId, 4), EMPTY_POINTER);
    }

    private getNextExecutionBlock(vaultId: i32): StoredU256 {
        return new StoredU256(this.vaultPointer(vaultId, 5), EMPTY_POINTER);
    }

    private getDepositorCount(vaultId: i32): StoredU256 {
        return new StoredU256(this.vaultPointer(vaultId, 6), EMPTY_POINTER);
    }

    private getDepositorAddresses(vaultId: i32): StoredAddressArray {
        return new StoredAddressArray(this.vaultPointer(vaultId, 7), EMPTY_POINTER);
    }

    private getDepositorAmounts(vaultId: i32): StoredU256Array {
        return new StoredU256Array(this.vaultPointer(vaultId, 8), EMPTY_POINTER);
    }

    private findAddressIndex(addresses: StoredAddressArray, count: i32, target: Address): i32 {
        for (let i: i32 = 0; i < count; i++) {
            if (addresses.get(i).equals(target)) return i;
        }
        return -1;
    }

    // ====== Write Methods ======

    /** Create a new DCA vault */
    @method(
        { name: 'scheduleType', type: ABIDataTypes.UINT256 },
        { name: 'duration', type: ABIDataTypes.UINT256 },
        { name: 'minDeposit', type: ABIDataTypes.UINT256 },
    )
    @returns({ name: 'vaultId', type: ABIDataTypes.UINT256 })
    public createVault(calldata: Calldata): BytesWriter {
        const scheduleType = calldata.readU256();
        const duration = calldata.readU256();
        const minDeposit = calldata.readU256();

        const count = this.vaultCountStore.value.toI32();
        if (count >= MAX_VAULTS) throw new Revert('Max vaults reached');
        if (duration == ZERO) throw new Revert('Duration must be > 0');

        const vaultId = count;

        // Calculate next execution block
        const currentBlockU256 = u256.fromU64(Blockchain.block.number);
        const blocksPerPeriod = scheduleType == SCHEDULE_DAILY ? BLOCKS_PER_DAY : BLOCKS_PER_WEEK;
        const nextExec = SafeMath.add(currentBlockU256, blocksPerPeriod);

        // Initialize vault storage
        this.getScheduleType(vaultId).value = scheduleType;
        this.getDuration(vaultId).value = duration;
        this.getMinDeposit(vaultId).value = minDeposit;
        this.getTotalDeposited(vaultId).value = ZERO;
        this.getTotalPurchased(vaultId).value = ZERO;
        this.getNextExecutionBlock(vaultId).value = nextExec;
        this.getDepositorCount(vaultId).value = ZERO;

        this.vaultCountStore.value = SafeMath.add(this.vaultCountStore.value, ONE);

        const writer = new BytesWriter(32);
        writer.writeU256(u256.fromU64(vaultId as u64));
        return writer;
    }

    /** Deposit BTC into a vault */
    @method(
        { name: 'vaultId', type: ABIDataTypes.UINT256 },
        { name: 'amount', type: ABIDataTypes.UINT256 },
    )
    @returns({ name: 'success', type: ABIDataTypes.BOOL })
    public deposit(calldata: Calldata): BytesWriter {
        const vaultIdRaw = calldata.readU256();
        const amount = calldata.readU256();
        const vaultId = vaultIdRaw.toI32();

        if (vaultId >= this.vaultCountStore.value.toI32()) throw new Revert('Vault does not exist');
        if (amount == ZERO) throw new Revert('Amount must be > 0');

        const minDep = this.getMinDeposit(vaultId).value;
        if (u256.lt(amount, minDep)) throw new Revert('Below minimum deposit');

        const totalDepStore = this.getTotalDeposited(vaultId);
        const depCountStore = this.getDepositorCount(vaultId);
        const depAddresses = this.getDepositorAddresses(vaultId);
        const depAmounts = this.getDepositorAmounts(vaultId);

        // Update total
        totalDepStore.value = SafeMath.add(totalDepStore.value, amount);

        // Update user deposit
        const sender = Blockchain.tx.sender;
        const count = depCountStore.value.toI32();
        const idx = this.findAddressIndex(depAddresses, count, sender);

        if (idx == -1) {
            depAddresses.push(sender);
            depAmounts.push(amount);
            depCountStore.value = SafeMath.add(depCountStore.value, ONE);
        } else {
            const current = depAmounts.get(idx);
            depAmounts.set(idx, SafeMath.add(current, amount));
        }

        depAddresses.save();
        depAmounts.save();

        const writer = new BytesWriter(32);
        writer.writeBoolean(true);
        return writer;
    }

    /** Execute DCA purchase for a vault (if execution block reached) */
    @method(
        { name: 'vaultId', type: ABIDataTypes.UINT256 },
    )
    @returns({ name: 'purchaseAmount', type: ABIDataTypes.UINT256 })
    public executeDCA(calldata: Calldata): BytesWriter {
        const vaultIdRaw = calldata.readU256();
        const vaultId = vaultIdRaw.toI32();

        if (vaultId >= this.vaultCountStore.value.toI32()) throw new Revert('Vault does not exist');

        const nextExecStore = this.getNextExecutionBlock(vaultId);
        const currentBlockU256 = u256.fromU64(Blockchain.block.number);

        // Check if execution is due
        if (u256.lt(currentBlockU256, nextExecStore.value)) throw new Revert('Execution not yet due');

        const totalDepStore = this.getTotalDeposited(vaultId);
        const totalPurchStore = this.getTotalPurchased(vaultId);
        const duration = this.getDuration(vaultId).value;
        const scheduleType = this.getScheduleType(vaultId).value;

        if (duration == ZERO) throw new Revert('Invalid duration');

        // Purchase amount = totalDeposited / duration
        const purchaseAmount = SafeMath.div(totalDepStore.value, duration);

        // Update total purchased
        totalPurchStore.value = SafeMath.add(totalPurchStore.value, purchaseAmount);

        // Update next execution block
        const blocksPerPeriod = scheduleType == SCHEDULE_DAILY ? BLOCKS_PER_DAY : BLOCKS_PER_WEEK;
        nextExecStore.value = SafeMath.add(currentBlockU256, blocksPerPeriod);

        const writer = new BytesWriter(32);
        writer.writeU256(purchaseAmount);
        return writer;
    }

    /** Withdraw all deposits from a vault */
    @method(
        { name: 'vaultId', type: ABIDataTypes.UINT256 },
    )
    @returns({ name: 'amount', type: ABIDataTypes.UINT256 })
    public withdraw(calldata: Calldata): BytesWriter {
        const vaultIdRaw = calldata.readU256();
        const vaultId = vaultIdRaw.toI32();

        if (vaultId >= this.vaultCountStore.value.toI32()) throw new Revert('Vault does not exist');

        const totalDepStore = this.getTotalDeposited(vaultId);
        const depCountStore = this.getDepositorCount(vaultId);
        const depAddresses = this.getDepositorAddresses(vaultId);
        const depAmounts = this.getDepositorAmounts(vaultId);

        const sender = Blockchain.tx.sender;
        const count = depCountStore.value.toI32();
        const idx = this.findAddressIndex(depAddresses, count, sender);

        if (idx == -1) throw new Revert('No deposits found');

        const userAmount = depAmounts.get(idx);
        if (userAmount == ZERO) throw new Revert('Nothing to withdraw');

        // Subtract from vault total
        totalDepStore.value = SafeMath.sub(totalDepStore.value, userAmount);

        // Zero out user
        depAmounts.set(idx, ZERO);
        depAmounts.save();

        const writer = new BytesWriter(32);
        writer.writeU256(userAmount);
        return writer;
    }

    // ====== Read Methods ======

    @method()
    @returns({ name: 'count', type: ABIDataTypes.UINT256 })
    public getVaultCount(calldata: Calldata): BytesWriter {
        const writer = new BytesWriter(32);
        writer.writeU256(this.vaultCountStore.value);
        return writer;
    }

    /** Get vault info */
    @method(
        { name: 'vaultId', type: ABIDataTypes.UINT256 },
    )
    @returns(
        { name: 'scheduleType', type: ABIDataTypes.UINT256 },
        { name: 'duration', type: ABIDataTypes.UINT256 },
        { name: 'minDeposit', type: ABIDataTypes.UINT256 },
        { name: 'totalDeposited', type: ABIDataTypes.UINT256 },
        { name: 'totalPurchased', type: ABIDataTypes.UINT256 },
        { name: 'nextExecutionBlock', type: ABIDataTypes.UINT256 },
    )
    public getVault(calldata: Calldata): BytesWriter {
        const vaultIdRaw = calldata.readU256();
        const vaultId = vaultIdRaw.toI32();

        if (vaultId >= this.vaultCountStore.value.toI32()) throw new Revert('Vault does not exist');

        const writer = new BytesWriter(192);
        writer.writeU256(this.getScheduleType(vaultId).value);
        writer.writeU256(this.getDuration(vaultId).value);
        writer.writeU256(this.getMinDeposit(vaultId).value);
        writer.writeU256(this.getTotalDeposited(vaultId).value);
        writer.writeU256(this.getTotalPurchased(vaultId).value);
        writer.writeU256(this.getNextExecutionBlock(vaultId).value);
        return writer;
    }

    /** Get user position in a vault */
    @method(
        { name: 'vaultId', type: ABIDataTypes.UINT256 },
        { name: 'user', type: ABIDataTypes.ADDRESS },
    )
    @returns(
        { name: 'deposited', type: ABIDataTypes.UINT256 },
        { name: 'share', type: ABIDataTypes.UINT256 },
    )
    public getUserPosition(calldata: Calldata): BytesWriter {
        const vaultIdRaw = calldata.readU256();
        const user = calldata.readAddress();
        const vaultId = vaultIdRaw.toI32();

        if (vaultId >= this.vaultCountStore.value.toI32()) throw new Revert('Vault does not exist');

        const totalDepStore = this.getTotalDeposited(vaultId);
        const depCountStore = this.getDepositorCount(vaultId);
        const depAddresses = this.getDepositorAddresses(vaultId);
        const depAmounts = this.getDepositorAmounts(vaultId);

        const count = depCountStore.value.toI32();
        const idx = this.findAddressIndex(depAddresses, count, user);

        const writer = new BytesWriter(64);

        if (idx == -1 || totalDepStore.value == ZERO) {
            writer.writeU256(ZERO);
            writer.writeU256(ZERO);
            return writer;
        }

        const userAmount = depAmounts.get(idx);
        // Share in basis points: userAmount * 10000 / totalDeposited
        const share = SafeMath.div(SafeMath.mul(userAmount, SHARE_PRECISION), totalDepStore.value);

        writer.writeU256(userAmount);
        writer.writeU256(share);
        return writer;
    }
}

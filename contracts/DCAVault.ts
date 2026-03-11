import {
    OP_NET,
    Blockchain,
    Address,
    Calldata,
    BytesWriter,
    Selector,
    Map,
    encodeSelector,
    Revert,
} from '@btc-vision/btc-runtime/runtime';

import { u256 } from 'as-bignum/assembly';

// Schedule types
const SCHEDULE_DAILY: u8 = 0;
const SCHEDULE_WEEKLY: u8 = 1;

// Blocks per period (approximate)
const BLOCKS_PER_DAY: u64 = 144;
const BLOCKS_PER_WEEK: u64 = 1008;

// Method selectors
const CREATE_VAULT_SELECTOR: Selector = encodeSelector('createVault');
const DEPOSIT_SELECTOR: Selector = encodeSelector('deposit');
const EXECUTE_DCA_SELECTOR: Selector = encodeSelector('executeDCA');
const WITHDRAW_SELECTOR: Selector = encodeSelector('withdraw');
const GET_VAULT_SELECTOR: Selector = encodeSelector('getVault');
const GET_USER_POSITION_SELECTOR: Selector = encodeSelector('getUserPosition');
const GET_VAULT_COUNT_SELECTOR: Selector = encodeSelector('getVaultCount');

// Storage pointers
const VAULT_COUNT_POINTER: u16 = 0;
const VAULT_MAP_POINTER: u16 = 1;
const PARTICIPANT_MAP_POINTER: u16 = 2;
const VAULT_PARTICIPANTS_POINTER: u16 = 3;

@final
export class DCAVault extends OP_NET {
    // ──────── Storage ────────
    private _vaultCount: Map<u8, u64> = new Map<u8, u64>(VAULT_COUNT_POINTER);

    // Vault data: vaultId => packed vault data
    private _vaults: Map<u64, BytesWriter> = new Map<u64, BytesWriter>(VAULT_MAP_POINTER);

    // Participant data: hash(vaultId, address) => packed participant data
    private _participants: Map<u256, BytesWriter> = new Map<u256, BytesWriter>(PARTICIPANT_MAP_POINTER);

    // Vault participant count: vaultId => count
    private _vaultParticipantCount: Map<u64, u32> = new Map<u64, u32>(VAULT_PARTICIPANTS_POINTER);

    // ──────── Method Router ────────
    public override callMethod(method: Selector, calldata: Calldata): BytesWriter {
        switch (method) {
            case CREATE_VAULT_SELECTOR:
                return this.createVault(calldata);
            case DEPOSIT_SELECTOR:
                return this.deposit(calldata);
            case EXECUTE_DCA_SELECTOR:
                return this.executeDCA(calldata);
            case WITHDRAW_SELECTOR:
                return this.withdraw(calldata);
            case GET_VAULT_SELECTOR:
                return this.getVault(calldata);
            case GET_USER_POSITION_SELECTOR:
                return this.getUserPosition(calldata);
            case GET_VAULT_COUNT_SELECTOR:
                return this.getVaultCount();
            default:
                return super.callMethod(method, calldata);
        }
    }

    // ──────── createVault ────────
    // Args: scheduleType (u8), duration (u64), minDeposit (u256)
    // Returns: vaultId (u64)
    private createVault(calldata: Calldata): BytesWriter {
        const scheduleType = calldata.readU8();
        const duration = calldata.readU64();
        const minDeposit = calldata.readU256();

        // Validate schedule type
        if (scheduleType !== SCHEDULE_DAILY && scheduleType !== SCHEDULE_WEEKLY) {
            Revert('Invalid schedule type');
        }

        // Validate duration
        if (duration == 0) {
            Revert('Duration must be > 0');
        }

        // Get and increment vault count
        let currentCount: u64 = 0;
        if (this._vaultCount.has(0)) {
            currentCount = this._vaultCount.get(0);
        }
        const vaultId = currentCount + 1;
        this._vaultCount.set(0, vaultId);

        // Calculate next execution block
        const blocksPerPeriod = scheduleType === SCHEDULE_DAILY ? BLOCKS_PER_DAY : BLOCKS_PER_WEEK;
        const nextExecution = Blockchain.blockNumber + blocksPerPeriod;

        // Store vault data
        const vaultData = new BytesWriter(256);
        vaultData.writeU64(vaultId);
        vaultData.writeU8(scheduleType);
        vaultData.writeU64(duration);
        vaultData.writeU256(minDeposit);
        vaultData.writeU256(u256.Zero); // totalDeposited
        vaultData.writeU256(u256.Zero); // totalPurchased
        vaultData.writeU64(nextExecution);
        vaultData.writeU32(0); // participantCount
        vaultData.writeAddress(Blockchain.tx.sender); // creator
        vaultData.writeBoolean(true); // active

        this._vaults.set(vaultId, vaultData);
        this._vaultParticipantCount.set(vaultId, 0);

        // Return vaultId
        const result = new BytesWriter(8);
        result.writeU64(vaultId);
        return result;
    }

    // ──────── deposit ────────
    // Args: vaultId (u64)
    // Returns: success (bool)
    private deposit(calldata: Calldata): BytesWriter {
        const vaultId = calldata.readU64();
        const depositAmount = Blockchain.tx.value;

        // Check vault exists
        if (!this._vaults.has(vaultId)) {
            Revert('Vault not found');
        }

        // Read vault data
        const vaultData = this._vaults.get(vaultId);
        const vault = this.decodeVault(vaultData);

        // Check vault is active
        if (!vault.active) {
            Revert('Vault is not active');
        }

        // Check minimum deposit
        if (u256.lt(depositAmount, vault.minDeposit)) {
            Revert('Deposit below minimum');
        }

        // Update vault total deposited
        vault.totalDeposited = u256.add(vault.totalDeposited, depositAmount);
        vault.participantCount += 1;

        // Update participant data
        const participantKey = this.getParticipantKey(vaultId, Blockchain.tx.sender);
        let participant: ParticipantData;

        if (this._participants.has(participantKey)) {
            const existingData = this._participants.get(participantKey);
            participant = this.decodeParticipant(existingData);
            participant.depositedAmount = u256.add(participant.depositedAmount, depositAmount);
        } else {
            participant = new ParticipantData();
            participant.address = Blockchain.tx.sender;
            participant.depositedAmount = depositAmount;
            participant.share = u256.Zero;
            participant.btcAccumulated = u256.Zero;
        }

        // Recalculate share (participant deposit / total deposited * 10000 for basis points)
        if (u256.gt(vault.totalDeposited, u256.Zero)) {
            const scaledDeposit = u256.mul(participant.depositedAmount, u256.fromU64(10000));
            participant.share = u256.div(scaledDeposit, vault.totalDeposited);
        }

        // Store updated data
        this._vaults.set(vaultId, this.encodeVault(vault));
        this._participants.set(participantKey, this.encodeParticipant(participant));

        const result = new BytesWriter(1);
        result.writeBoolean(true);
        return result;
    }

    // ──────── executeDCA ────────
    // Args: vaultId (u64)
    // Returns: success (bool)
    private executeDCA(calldata: Calldata): BytesWriter {
        const vaultId = calldata.readU64();

        if (!this._vaults.has(vaultId)) {
            Revert('Vault not found');
        }

        const vaultData = this._vaults.get(vaultId);
        const vault = this.decodeVault(vaultData);

        if (!vault.active) {
            Revert('Vault is not active');
        }

        // Check if execution is due
        if (Blockchain.blockNumber < vault.nextExecutionBlock) {
            Revert('Execution not yet due');
        }

        // Calculate purchase amount (simulated: use portion of total deposited)
        const purchaseAmount = u256.div(vault.totalDeposited, u256.fromU64(vault.duration));

        // Update vault
        vault.totalPurchased = u256.add(vault.totalPurchased, purchaseAmount);

        // Calculate next execution block
        const blocksPerPeriod = vault.scheduleType === SCHEDULE_DAILY ? BLOCKS_PER_DAY : BLOCKS_PER_WEEK;
        vault.nextExecutionBlock = Blockchain.blockNumber + blocksPerPeriod;

        // Store updated vault
        this._vaults.set(vaultId, this.encodeVault(vault));

        const result = new BytesWriter(1);
        result.writeBoolean(true);
        return result;
    }

    // ──────── withdraw ────────
    // Args: vaultId (u64)
    // Returns: success (bool)
    private withdraw(calldata: Calldata): BytesWriter {
        const vaultId = calldata.readU64();

        if (!this._vaults.has(vaultId)) {
            Revert('Vault not found');
        }

        const vaultData = this._vaults.get(vaultId);
        const vault = this.decodeVault(vaultData);

        const participantKey = this.getParticipantKey(vaultId, Blockchain.tx.sender);
        if (!this._participants.has(participantKey)) {
            Revert('Not a participant');
        }

        const participantData = this._participants.get(participantKey);
        const participant = this.decodeParticipant(participantData);

        // Calculate withdrawal: deposited amount + accumulated BTC
        const withdrawAmount = u256.add(participant.depositedAmount, participant.btcAccumulated);

        // Update vault
        vault.totalDeposited = u256.sub(vault.totalDeposited, participant.depositedAmount);
        vault.participantCount -= 1;

        // Remove participant
        participant.depositedAmount = u256.Zero;
        participant.share = u256.Zero;
        participant.btcAccumulated = u256.Zero;

        // Store updated data
        this._vaults.set(vaultId, this.encodeVault(vault));
        this._participants.set(participantKey, this.encodeParticipant(participant));

        // Transfer BTC to sender
        // Blockchain.transfer(Blockchain.tx.sender, withdrawAmount);

        const result = new BytesWriter(1);
        result.writeBoolean(true);
        return result;
    }

    // ──────── getVault ────────
    private getVault(calldata: Calldata): BytesWriter {
        const vaultId = calldata.readU64();

        if (!this._vaults.has(vaultId)) {
            Revert('Vault not found');
        }

        return this._vaults.get(vaultId);
    }

    // ──────── getUserPosition ────────
    private getUserPosition(calldata: Calldata): BytesWriter {
        const vaultId = calldata.readU64();
        const userAddress = calldata.readAddress();

        const participantKey = this.getParticipantKey(vaultId, userAddress);

        if (!this._participants.has(participantKey)) {
            // Return empty participant
            const empty = new BytesWriter(128);
            empty.writeAddress(userAddress);
            empty.writeU256(u256.Zero);
            empty.writeU256(u256.Zero);
            empty.writeU256(u256.Zero);
            return empty;
        }

        return this._participants.get(participantKey);
    }

    // ──────── getVaultCount ────────
    private getVaultCount(): BytesWriter {
        let count: u64 = 0;
        if (this._vaultCount.has(0)) {
            count = this._vaultCount.get(0);
        }
        const result = new BytesWriter(8);
        result.writeU64(count);
        return result;
    }

    // ──────── Helpers ────────
    private getParticipantKey(vaultId: u64, address: Address): u256 {
        const writer = new BytesWriter(32);
        writer.writeU64(vaultId);
        writer.writeAddress(address);
        return writer.toU256();
    }

    private decodeVault(data: BytesWriter): VaultData {
        const reader = data.toCalldata();
        const vault = new VaultData();
        vault.vaultId = reader.readU64();
        vault.scheduleType = reader.readU8();
        vault.duration = reader.readU64();
        vault.minDeposit = reader.readU256();
        vault.totalDeposited = reader.readU256();
        vault.totalPurchased = reader.readU256();
        vault.nextExecutionBlock = reader.readU64();
        vault.participantCount = reader.readU32();
        vault.creator = reader.readAddress();
        vault.active = reader.readBoolean();
        return vault;
    }

    private encodeVault(vault: VaultData): BytesWriter {
        const writer = new BytesWriter(256);
        writer.writeU64(vault.vaultId);
        writer.writeU8(vault.scheduleType);
        writer.writeU64(vault.duration);
        writer.writeU256(vault.minDeposit);
        writer.writeU256(vault.totalDeposited);
        writer.writeU256(vault.totalPurchased);
        writer.writeU64(vault.nextExecutionBlock);
        writer.writeU32(vault.participantCount);
        writer.writeAddress(vault.creator);
        writer.writeBoolean(vault.active);
        return writer;
    }

    private decodeParticipant(data: BytesWriter): ParticipantData {
        const reader = data.toCalldata();
        const p = new ParticipantData();
        p.address = reader.readAddress();
        p.depositedAmount = reader.readU256();
        p.share = reader.readU256();
        p.btcAccumulated = reader.readU256();
        return p;
    }

    private encodeParticipant(p: ParticipantData): BytesWriter {
        const writer = new BytesWriter(128);
        writer.writeAddress(p.address);
        writer.writeU256(p.depositedAmount);
        writer.writeU256(p.share);
        writer.writeU256(p.btcAccumulated);
        return writer;
    }
}

// ──────── Data Classes ────────
class VaultData {
    vaultId: u64 = 0;
    scheduleType: u8 = 0;
    duration: u64 = 0;
    minDeposit: u256 = u256.Zero;
    totalDeposited: u256 = u256.Zero;
    totalPurchased: u256 = u256.Zero;
    nextExecutionBlock: u64 = 0;
    participantCount: u32 = 0;
    creator: Address = Address.dead();
    active: bool = false;
}

class ParticipantData {
    address: Address = Address.dead();
    depositedAmount: u256 = u256.Zero;
    share: u256 = u256.Zero;
    btcAccumulated: u256 = u256.Zero;
}

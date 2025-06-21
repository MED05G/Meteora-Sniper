import { Commitment, ConfirmOptions, Connection, ConnectionConfig, PublicKey, SendOptions, Signer, Transaction, TransactionSignature, VersionedTransaction } from "@solana/web3.js";
import { default as Denque } from 'denque';
import { default as Logger } from '@matrixai/logger';
import * as peculiarWebcrypto from '@peculiar/webcrypto';
export declare class LeaderTpuCache {
    leaderTpuMap: Map<string, string>;
    connection: Connection;
    first_slot: number;
    slots_in_epoch: number;
    last_epoch_info_slot: number;
    leaders: Array<PublicKey>;
    private constructor();
    static load(connection: Connection, startSlot: number): Promise<LeaderTpuCache>;
    fetchClusterTpuSockets(): Promise<Map<string, string>>;
    fetchSlotLeaders(start_slot: number, slots_in_epoch: number): Promise<Array<PublicKey>>;
    lastSlot(): number;
    getSlotLeader(slot: number): PublicKey | null;
    getLeaderSockets(fanout_slots: number): Promise<Array<string>>;
}
export declare const MAX_SLOT_SKIP_DISTANCE = 48;
export declare const DEFAULT_FANOUT_SLOTS = 12;
export declare const MAX_FANOUT_SLOTS = 100;
export declare class RecentLeaderSlots {
    recent_slots: Denque;
    /**
     *
     * @param current_slot {number}
     */
    constructor(current_slot: number);
    /**
     *
     * @param current_slot {number}
     */
    recordSlot(current_slot: number): void;
    /**
     *
     * @returns {number}
     */
    estimatedCurrentSlot(): number;
}
export interface TpuClientConfig {
    fanoutSlots: number;
}
export declare class TpuClient {
    fanoutSlots: number;
    leaderTpuService: LeaderTpuService;
    exit: boolean;
    connection: Connection;
    /**
     * @param connection {Connection}
     * @param config {TpuClientConfig}
     */
    private constructor();
    /**
     * @param connection {Connection}
     * @param websocketUrl {string}
     * @param config {TpuClientConfig}
     * @returns {Promise<TpuClient>}
     */
    static load(connection: Connection, websocketUrl?: string, config?: TpuClientConfig): Promise<TpuClient>;
    /**
     * @param transaction {Transaction}
     * @param signers {Array<Signer>}
     * @returns {Promise<string>}
     */
    sendTransaction(transaction: Transaction | VersionedTransaction, signersOrOptions: Array<Signer> | SendOptions, _options?: SendOptions): Promise<TransactionSignature>;
    /**
     *
     * @param transaction
     * @param signersOrOptions
     * @param _options
     * @returns
     */
    sendAbortableTransaction(transaction: Transaction | VersionedTransaction, signersOrOptions: Array<Signer> | SendOptions, _options?: SendOptions): Promise<{
        signature: TransactionSignature;
        abortControllers: AbortController[];
        blockhash?: {
            blockhash: string;
            lastValidBlockHeight: number;
        };
    }>;
    /**
     * @param tpu_address
     * @param logger
     * @param webcrypto
     * @param rawTransaction
     * @param abortController
     * @param retryCount
     * @param retryMaxCount
     * @returns
     */
    sendSignedRawTransactionToQuicAddress(tpu_address: string, logger: Logger, webcrypto: peculiarWebcrypto.Crypto, rawTransaction: Buffer | number[] | Uint8Array, abortController?: AbortController, retryCount?: number, retryMaxCount?: number): any;
    /**
     *
     * @param rawTransaction
     * @returns
     */
    sendAbortableRawTransaction(rawTransaction: Buffer | number[] | Uint8Array): Promise<{
        signature: TransactionSignature;
        abortControllers: AbortController[];
    }>;
    /**
     *
     * @param rawTransaction {Buffer | number[] | Uint8ARray}
     * @returns {Promise<string>}
     */
    sendRawTransaction(rawTransaction: Buffer | number[] | Uint8Array): Promise<TransactionSignature>;
}
export declare class LeaderTpuService {
    recentSlots: RecentLeaderSlots;
    leaderTpuCache: LeaderTpuCache;
    subscription: number | null;
    connection: Connection;
    /**
     *
     * @param connection {Connection}
     */
    private constructor();
    /**
     *
     * @param connection {Connection}
     * @param websocket_url {string}
     * @returns {Promise<LeaderTpuService>}
     */
    static load(connection: Connection, websocket_url?: string): Promise<LeaderTpuService>;
    /**
     *
     * @param fanout_slots {number}
     * @returns {Promise<string[]>}
     */
    leaderTpuSockets(fanout_slots: number): Promise<string[]>;
    /**
     * @returns {void}
     */
    run(): Promise<void>;
}
export declare class TpuConnection extends Connection {
    tpuClient: TpuClient;
    /**
     *
     * @param endpoint {string}
     * @param commitmentOrConfig {Commitment | ConnectionConfig}
     */
    private constructor();
    /**
     *
     * @param transaction {Transaction}
     * @param signers {Array<Signer>}
     * @returns {Promise<string>}
     */
    sendTransaction(transaction: Transaction | VersionedTransaction, signers: Array<Signer> | SendOptions, sendOptions?: SendOptions): Promise<TransactionSignature>;
    /**
     *
     * @param transaction
     * @param signers
     * @param sendOptions
     * @returns
     */
    sendAbortableTransaction(transaction: Transaction | VersionedTransaction, signers: Array<Signer> | SendOptions, sendOptions?: SendOptions): Promise<{
        signature: TransactionSignature;
        abortControllers: AbortController[];
    }>;
    /**
     *
     * @param rawTransaction {Buffer | Array<number> | Uint8Array}
     * @returns {Promise<string>}
     */
    sendRawTransaction(rawTransaction: Buffer | Array<number> | Uint8Array): Promise<TransactionSignature>;
    /**
     *
     * @param rawTransaction
     * @returns
     */
    sendAbortableRawTransaction(rawTransaction: Buffer | Array<number> | Uint8Array): Promise<{
        signature: TransactionSignature;
        abortControllers: AbortController[];
    }>;
    /**
     *
     * @param connection {TpuConnection}
     * @param transaction {Transaction}
     * @param signers {Array<Signer>}
     * @param options {ConfirmOptions}
     * @returns {Promise<TransactionSignature>}
     */
    sendAndConfirmTransaction(transaction: Transaction, signers: Array<Signer>, options?: ConfirmOptions): Promise<TransactionSignature>;
    /**
     *
     * @param connection {TpuConnection}
     * @param rawTransaction {Buffer | Array<number> | Uint8Array}
     * @param options {ConfirmOptions}
     * @returns {Promise<string>}
     */
    sendAndConfirmRawTransaction(rawTransaction: Buffer | Array<number> | Uint8Array, options?: ConfirmOptions): Promise<TransactionSignature>;
    /**
     *
     * @param transaction
     * @param signers
     * @param sendOptions
     * @returns
     */
    sendAndConfirmAbortableTransaction(transaction: Transaction | VersionedTransaction, signers: Array<Signer> | SendOptions, sendOptions?: SendOptions): Promise<TransactionSignature>;
    /**
     *
     * @param rawTransaction
     * @param blockhash
     * @returns
     */
    sendAndConfirmAbortableRawTransaction(rawTransaction: Buffer | Array<number> | Uint8Array, blockhash?: {
        blockhash: string;
        lastValidBlockHeight: number;
    }): Promise<TransactionSignature>;
    /**
     *
     * @param endpoint {string}
     * @param commitmentOrConfig {Commitment | ConnectionConfig}
     * @returns {Promise<TpuConnection>}
     */
    static load(endpoint: string, commitmentOrConfig?: Commitment | ConnectionConfig): Promise<TpuConnection>;
}
//# sourceMappingURL=index.d.ts.map
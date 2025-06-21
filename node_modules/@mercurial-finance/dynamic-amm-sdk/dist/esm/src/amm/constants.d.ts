import { TokenInfo } from '@solana/spl-token-registry';
import { PublicKey } from '@solana/web3.js';
export declare const ERROR: {
    POOL_NOT_LOAD: string;
    INVALID_MINT: string;
    INVALID_ACCOUNT: string;
};
export declare const PROGRAM_ID = "Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB";
export declare const STAGING_PROGRAM_ID = "ammbh4CQztZ6txJ8AaQgPsWjd6o7GhmvopS2JAo5bCB";
export declare const DEVNET_COIN: Array<TokenInfo>;
export declare const DEVNET_POOL: Readonly<{
    USDT_USDC: PublicKey;
    USDT_SOL: PublicKey;
    SOL_MSOL: PublicKey;
}>;
export declare const MAINNET_POOL: Readonly<{
    USDT_USDC: PublicKey;
    USDC_SOL: PublicKey;
    SOL_STSOL: PublicKey;
    SOL_MSOL: PublicKey;
}>;
export declare const CURVE_TYPE_ACCOUNTS: {
    marinade: PublicKey;
    lido: PublicKey;
};
export declare const SEEDS: Readonly<{
    APY: "apy";
    FEE: "fee";
    LP_MINT: "lp_mint";
    LOCK_ESCROW: "lock_escrow";
}>;
export declare const VAULT_BASE_KEY: PublicKey;
export declare const POOL_BASE_KEY: PublicKey;
export declare const DEFAULT_SLIPPAGE = 1;
export declare const UNLOCK_AMOUNT_BUFFER = 0.998;
export declare const VIRTUAL_PRICE_PRECISION: import("bn.js");
export declare const PERMISSIONLESS_AMP: import("bn.js");
export declare const FEE_OWNER: PublicKey;
export declare const CONSTANT_PRODUCT_DEFAULT_TRADE_FEE_BPS = 25;
export declare const CONSTANT_PRODUCT_ALLOWED_TRADE_FEE_BPS: number[];
export declare const STABLE_SWAP_DEFAULT_TRADE_FEE_BPS = 1;
export declare const STABLE_SWAP_ALLOWED_TRADE_FEE_BPS: number[];
export declare const METAPLEX_PROGRAM: PublicKey;
export declare const U64_MAX: import("bn.js");
//# sourceMappingURL=constants.d.ts.map
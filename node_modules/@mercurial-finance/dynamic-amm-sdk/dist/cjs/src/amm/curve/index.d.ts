import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import Decimal from 'decimal.js';
import { Depeg, PoolFees } from '../types';
export interface OutResult {
    outAmount: BN;
    priceImpact: Decimal;
}
export interface SwapCurve {
    depeg?: Depeg;
    computeOutAmount(sourceAmount: BN, swapSourceAmount: BN, swapDestinationAmount: BN, tradeDirection: TradeDirection): OutResult;
    computeD(tokenAAmount: BN, tokenBAmount: BN): BN;
    computeInAmount(destAmount: BN, swapSourceAmount: BN, swapDestinationAmount: BN, tradeDirection: TradeDirection): BN;
    computeImbalanceDeposit(depositAAmount: BN, depositBAmount: BN, swapTokenAAmount: BN, swapTokenBAmount: BN, lpSupply: BN, fees: PoolFees): BN;
    computeWithdrawOne(lpAmount: BN, lpSupply: BN, swapTokenAAmount: BN, swapTokenBAmount: BN, fees: PoolFees, tradeDirection: TradeDirection): BN;
    getRemainingAccounts(): Array<{
        pubkey: PublicKey;
        isWritable: boolean;
        isSigner: boolean;
    }>;
}
export declare enum TradeDirection {
    AToB = 0,
    BToA = 1
}
export declare const getPriceImpact: (amount: BN, amountWithoutSlippage: BN) => Decimal;
export * from './stable-swap';
export * from './constant-product';
//# sourceMappingURL=index.d.ts.map
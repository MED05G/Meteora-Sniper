import { BN } from '@coral-xyz/anchor';
import { AccountInfo, PublicKey } from '@solana/web3.js';
import { OutResult, SwapCurve, TradeDirection } from '.';
import { Depeg, PoolFees, TokenMultiplier } from '../types';
export declare class StableSwap implements SwapCurve {
    private amp;
    private tokenMultiplier;
    depeg: Depeg;
    private extraAccounts;
    private onChainTime;
    private stakePoolPubkey;
    constructor(amp: number, tokenMultiplier: TokenMultiplier, depeg: Depeg, extraAccounts: Map<String, AccountInfo<Buffer>>, onChainTime: BN, stakePoolPubkey: PublicKey);
    private getBasePoolVirtualPrice;
    private updateDepegInfoIfExpired;
    private upscaleTokenA;
    private downscaleTokenA;
    private upscaleTokenB;
    private downscaleTokenB;
    private computeOutAmountWithoutSlippage;
    computeOutAmount(sourceAmount: BN, swapSourceAmount: BN, swapDestinationAmount: BN, tradeDirection: TradeDirection): OutResult;
    computeD(tokenAAmount: BN, tokenBAmount: BN): BN;
    computeInAmount(destAmount: BN, swapSourceAmount: BN, swapDestinationAmount: BN, tradeDirection: TradeDirection): BN;
    computeImbalanceDeposit(depositAAmount: BN, depositBAmount: BN, swapTokenAAmount: BN, swapTokenBAmount: BN, lpSupply: BN, fees: PoolFees): BN;
    computeWithdrawOne(lpAmount: BN, lpSupply: BN, swapTokenAAmount: BN, swapTokenBAmount: BN, fees: PoolFees, tradeDirection: TradeDirection): BN;
    getRemainingAccounts(): {
        pubkey: PublicKey;
        isWritable: boolean;
        isSigner: boolean;
    }[];
}
//# sourceMappingURL=stable-swap.d.ts.map
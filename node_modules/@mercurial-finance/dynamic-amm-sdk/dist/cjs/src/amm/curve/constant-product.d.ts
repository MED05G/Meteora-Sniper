import { BN } from '@coral-xyz/anchor';
import { OutResult, SwapCurve, TradeDirection } from '.';
import { PoolFees } from '../types';
export declare class ConstantProductSwap implements SwapCurve {
    constructor();
    private computeOutAmountWithoutSlippage;
    computeOutAmount(sourceAmount: BN, swapSourceAmount: BN, swapDestinationAmount: BN, _tradeDirection: TradeDirection): OutResult;
    computeD(tokenAAmount: BN, tokenBAmount: BN): BN;
    computeInAmount(destAmount: BN, swapSourceAmount: BN, swapDestinationAmount: BN, _tradeDirection: TradeDirection): BN;
    computeImbalanceDeposit(_depositAAmount: BN, _depositBAmount: BN, _swapTokenAAmount: BN, _swapTokenBAmount: BN, _lpSupply: BN, _fees: PoolFees): BN;
    computeWithdrawOne(_lpAmount: BN, _lpSupply: BN, _swapTokenAAmount: BN, _swapTokenBAmount: BN, _fees: PoolFees, _tradeDirection: TradeDirection): BN;
    getRemainingAccounts(): never[];
}
//# sourceMappingURL=constant-product.d.ts.map
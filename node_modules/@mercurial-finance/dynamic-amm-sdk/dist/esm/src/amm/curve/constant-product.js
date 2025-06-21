import sqrt from 'bn-sqrt';
import { BN } from '@coral-xyz/anchor';
import { getPriceImpact } from '.';
// Typescript implementation of https://github.com/solana-labs/solana-program-library/blob/master/libraries/math/src/checked_ceil_div.rs#L29
function ceilDiv(lhs, rhs) {
    let quotient = lhs.div(rhs);
    // Avoid dividing a small number by a big one and returning 1, and instead
    // fail.
    if (quotient.eq(new BN(0))) {
        throw new Error('ceilDiv result in zero');
    }
    let remainder = lhs.mod(rhs);
    if (remainder.gt(new BN(0))) {
        quotient = quotient.add(new BN(1));
        rhs = lhs.div(quotient);
        remainder = lhs.mod(quotient);
        if (remainder.gt(new BN(0))) {
            rhs = rhs.add(new BN(1));
        }
    }
    return [quotient, rhs];
}
export class ConstantProductSwap {
    constructor() { }
    computeOutAmountWithoutSlippage(sourceAmount, swapSourceAmount, swapDestinationAmount) {
        return sourceAmount.mul(swapDestinationAmount).div(swapSourceAmount);
    }
    // Typescript implementation of https://github.com/solana-labs/solana-program-library/blob/master/token-swap/program/src/curve/constant_product.rs#L27
    computeOutAmount(sourceAmount, swapSourceAmount, swapDestinationAmount, _tradeDirection) {
        let invariant = swapSourceAmount.mul(swapDestinationAmount);
        let [newSwapDestinationAmount, _newSwapSourceAmount] = ceilDiv(invariant, swapSourceAmount.add(sourceAmount));
        let destinationAmountSwapped = swapDestinationAmount.sub(newSwapDestinationAmount);
        if (destinationAmountSwapped.eq(new BN(0))) {
            throw new Error('Swap result in zero');
        }
        const destinationAmountWithoutSlippage = this.computeOutAmountWithoutSlippage(sourceAmount, swapSourceAmount, swapDestinationAmount);
        return {
            outAmount: destinationAmountSwapped,
            priceImpact: getPriceImpact(destinationAmountSwapped, destinationAmountWithoutSlippage),
        };
    }
    computeD(tokenAAmount, tokenBAmount) {
        return sqrt(tokenAAmount.mul(tokenBAmount));
    }
    computeInAmount(destAmount, swapSourceAmount, swapDestinationAmount, _tradeDirection) {
        let invariant = swapSourceAmount.mul(swapDestinationAmount);
        let [newSwapSourceAmount, _newSwapDestinationAmount] = ceilDiv(invariant, swapDestinationAmount.sub(destAmount));
        let sourceAmount = newSwapSourceAmount.sub(swapSourceAmount);
        if (sourceAmount.eq(new BN(0))) {
            throw new Error('Swap result in zero');
        }
        return sourceAmount;
    }
    computeImbalanceDeposit(_depositAAmount, _depositBAmount, _swapTokenAAmount, _swapTokenBAmount, _lpSupply, _fees) {
        throw new Error('UnsupportedOperation');
    }
    computeWithdrawOne(_lpAmount, _lpSupply, _swapTokenAAmount, _swapTokenBAmount, _fees, _tradeDirection) {
        throw new Error('UnsupportedOperation');
    }
    getRemainingAccounts() {
        return [];
    }
}
//# sourceMappingURL=constant-product.js.map
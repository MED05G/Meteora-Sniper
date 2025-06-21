"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstantProductSwap = void 0;
const bn_sqrt_1 = __importDefault(require("bn-sqrt"));
const anchor_1 = require("@coral-xyz/anchor");
const _1 = require(".");
// Typescript implementation of https://github.com/solana-labs/solana-program-library/blob/master/libraries/math/src/checked_ceil_div.rs#L29
function ceilDiv(lhs, rhs) {
    let quotient = lhs.div(rhs);
    // Avoid dividing a small number by a big one and returning 1, and instead
    // fail.
    if (quotient.eq(new anchor_1.BN(0))) {
        throw new Error('ceilDiv result in zero');
    }
    let remainder = lhs.mod(rhs);
    if (remainder.gt(new anchor_1.BN(0))) {
        quotient = quotient.add(new anchor_1.BN(1));
        rhs = lhs.div(quotient);
        remainder = lhs.mod(quotient);
        if (remainder.gt(new anchor_1.BN(0))) {
            rhs = rhs.add(new anchor_1.BN(1));
        }
    }
    return [quotient, rhs];
}
class ConstantProductSwap {
    constructor() { }
    computeOutAmountWithoutSlippage(sourceAmount, swapSourceAmount, swapDestinationAmount) {
        return sourceAmount.mul(swapDestinationAmount).div(swapSourceAmount);
    }
    // Typescript implementation of https://github.com/solana-labs/solana-program-library/blob/master/token-swap/program/src/curve/constant_product.rs#L27
    computeOutAmount(sourceAmount, swapSourceAmount, swapDestinationAmount, _tradeDirection) {
        let invariant = swapSourceAmount.mul(swapDestinationAmount);
        let [newSwapDestinationAmount, _newSwapSourceAmount] = ceilDiv(invariant, swapSourceAmount.add(sourceAmount));
        let destinationAmountSwapped = swapDestinationAmount.sub(newSwapDestinationAmount);
        if (destinationAmountSwapped.eq(new anchor_1.BN(0))) {
            throw new Error('Swap result in zero');
        }
        const destinationAmountWithoutSlippage = this.computeOutAmountWithoutSlippage(sourceAmount, swapSourceAmount, swapDestinationAmount);
        return {
            outAmount: destinationAmountSwapped,
            priceImpact: (0, _1.getPriceImpact)(destinationAmountSwapped, destinationAmountWithoutSlippage),
        };
    }
    computeD(tokenAAmount, tokenBAmount) {
        return (0, bn_sqrt_1.default)(tokenAAmount.mul(tokenBAmount));
    }
    computeInAmount(destAmount, swapSourceAmount, swapDestinationAmount, _tradeDirection) {
        let invariant = swapSourceAmount.mul(swapDestinationAmount);
        let [newSwapSourceAmount, _newSwapDestinationAmount] = ceilDiv(invariant, swapDestinationAmount.sub(destAmount));
        let sourceAmount = newSwapSourceAmount.sub(swapSourceAmount);
        if (sourceAmount.eq(new anchor_1.BN(0))) {
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
exports.ConstantProductSwap = ConstantProductSwap;
//# sourceMappingURL=constant-product.js.map
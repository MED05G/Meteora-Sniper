import { Fraction, Percent } from '@mercurial-finance/token-math';
export { Fraction, ONE, Percent, ZERO } from '@mercurial-finance/token-math';
/**
 * Compute the StableSwap invariant
 * @param ampFactor Amplification coefficient (A)
 * @param amountA Swap balance of token A
 * @param amountB Swap balance of token B
 * Reference: https://github.com/curvefi/curve-contract/blob/7116b4a261580813ef057887c5009e22473ddb7d/tests/simulation.py#L31
 */
export declare const computeD: (ampFactor: bigint, amountA: bigint, amountB: bigint) => bigint;
/**
 * Compute Y amount in respect to X on the StableSwap curve
 * @param ampFactor Amplification coefficient (A)
 * @param x The quantity of underlying asset
 * @param d StableSwap invariant
 * Reference: https://github.com/curvefi/curve-contract/blob/7116b4a261580813ef057887c5009e22473ddb7d/tests/simulation.py#L55
 */
export declare const computeY: (ampFactor: bigint, x: bigint, d: bigint) => bigint;
export type Fees = {
    trade: Percent;
    withdraw: Percent;
    adminTrade: Percent;
    adminWithdraw: Percent;
};
/**
 * Compute normalized fee for symmetric/asymmetric deposits/withdraws
 */
export declare const normalizedTradeFee: ({ trade }: Fees, n_coins: bigint, amount: bigint) => Fraction;
//# sourceMappingURL=calculator.d.ts.map
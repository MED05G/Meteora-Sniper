"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizedTradeFee = exports.computeY = exports.computeD = exports.ZERO = exports.Percent = exports.ONE = exports.Fraction = void 0;
const token_math_1 = require("@mercurial-finance/token-math");
var token_math_2 = require("@mercurial-finance/token-math");
Object.defineProperty(exports, "Fraction", { enumerable: true, get: function () { return token_math_2.Fraction; } });
Object.defineProperty(exports, "ONE", { enumerable: true, get: function () { return token_math_2.ONE; } });
Object.defineProperty(exports, "Percent", { enumerable: true, get: function () { return token_math_2.Percent; } });
Object.defineProperty(exports, "ZERO", { enumerable: true, get: function () { return token_math_2.ZERO; } });
const N_COINS = BigInt(2); // n
const abs = (a) => {
    if (a > token_math_1.ZERO) {
        return a;
    }
    return -a;
};
// maximum iterations of newton's method approximation
const MAX_ITERS = 20;
/**
 * Compute the StableSwap invariant
 * @param ampFactor Amplification coefficient (A)
 * @param amountA Swap balance of token A
 * @param amountB Swap balance of token B
 * Reference: https://github.com/curvefi/curve-contract/blob/7116b4a261580813ef057887c5009e22473ddb7d/tests/simulation.py#L31
 */
const computeD = (ampFactor, amountA, amountB) => {
    const Ann = ampFactor * N_COINS; // A*n^n
    const S = amountA + amountB; // sum(x_i), a.k.a S
    if (S === token_math_1.ZERO) {
        return token_math_1.ZERO;
    }
    let dPrev = token_math_1.ZERO;
    let d = S;
    for (let i = 0; abs(d - dPrev) > token_math_1.ONE && i < MAX_ITERS; i++) {
        dPrev = d;
        let dP = d;
        dP = (dP * d) / (amountA * N_COINS);
        dP = (dP * d) / (amountB * N_COINS);
        const dNumerator = d * (Ann * S + dP * N_COINS);
        const dDenominator = d * (Ann - token_math_1.ONE) + dP * (N_COINS + token_math_1.ONE);
        d = dNumerator / dDenominator;
    }
    return d;
};
exports.computeD = computeD;
/**
 * Compute Y amount in respect to X on the StableSwap curve
 * @param ampFactor Amplification coefficient (A)
 * @param x The quantity of underlying asset
 * @param d StableSwap invariant
 * Reference: https://github.com/curvefi/curve-contract/blob/7116b4a261580813ef057887c5009e22473ddb7d/tests/simulation.py#L55
 */
const computeY = (ampFactor, x, d) => {
    const Ann = ampFactor * N_COINS; // A*n^n
    // sum' = prod' = x
    const b = x + d / Ann - d; // b = sum' - (A*n**n - 1) * D / (A * n**n)
    // c =  D ** (n + 1) / (n ** (2 * n) * prod' * A)
    const c = (d * d * d) / (N_COINS * (N_COINS * (x * Ann)));
    let yPrev = token_math_1.ZERO;
    let y = d;
    for (let i = 0; i < MAX_ITERS && abs(y - yPrev) > token_math_1.ONE; i++) {
        yPrev = y;
        y = (y * y + c) / (N_COINS * y + b);
    }
    return y;
};
exports.computeY = computeY;
/**
 * Compute normalized fee for symmetric/asymmetric deposits/withdraws
 */
const normalizedTradeFee = ({ trade }, n_coins, amount) => {
    const adjustedTradeFee = new token_math_1.Fraction(n_coins, (n_coins - token_math_1.ONE) * BigInt(4));
    return new token_math_1.Fraction(amount, 1).multiply(trade).multiply(adjustedTradeFee);
};
exports.normalizedTradeFee = normalizedTradeFee;
//# sourceMappingURL=calculator.js.map
import Decimal from 'decimal.js';
export var TradeDirection;
(function (TradeDirection) {
    TradeDirection[TradeDirection["AToB"] = 0] = "AToB";
    TradeDirection[TradeDirection["BToA"] = 1] = "BToA";
})(TradeDirection || (TradeDirection = {}));
export const getPriceImpact = (amount, amountWithoutSlippage) => {
    const diff = amountWithoutSlippage.sub(amount);
    return new Decimal(diff.toString()).div(new Decimal(amountWithoutSlippage.toString()));
};
export * from './stable-swap';
export * from './constant-product';
//# sourceMappingURL=index.js.map
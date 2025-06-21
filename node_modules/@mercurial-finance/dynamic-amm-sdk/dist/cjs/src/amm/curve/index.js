"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPriceImpact = exports.TradeDirection = void 0;
const decimal_js_1 = __importDefault(require("decimal.js"));
var TradeDirection;
(function (TradeDirection) {
    TradeDirection[TradeDirection["AToB"] = 0] = "AToB";
    TradeDirection[TradeDirection["BToA"] = 1] = "BToA";
})(TradeDirection || (exports.TradeDirection = TradeDirection = {}));
const getPriceImpact = (amount, amountWithoutSlippage) => {
    const diff = amountWithoutSlippage.sub(amount);
    return new decimal_js_1.default(diff.toString()).div(new decimal_js_1.default(amountWithoutSlippage.toString()));
};
exports.getPriceImpact = getPriceImpact;
__exportStar(require("./stable-swap"), exports);
__exportStar(require("./constant-product"), exports);
//# sourceMappingURL=index.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivationType = exports.ClockLayout = exports.StakePoolLayout = exports.AccountType = void 0;
const borsh_1 = require("@coral-xyz/borsh");
var AccountType;
(function (AccountType) {
    AccountType["APY"] = "apy";
    AccountType["VAULT_A_RESERVE"] = "vaultAReserve";
    AccountType["VAULT_B_RESERVE"] = "vaultBReserve";
    AccountType["VAULT_A_LP"] = "vaultALp";
    AccountType["VAULT_B_LP"] = "vaultBLp";
    AccountType["POOL_VAULT_A_LP"] = "poolVaultALp";
    AccountType["POOL_VAULT_B_LP"] = "poolVaultBLp";
    AccountType["POOL_LP_MINT"] = "poolLpMint";
    AccountType["SYSVAR_CLOCK"] = "sysClockVar";
})(AccountType || (exports.AccountType = AccountType = {}));
exports.StakePoolLayout = (0, borsh_1.struct)([
    (0, borsh_1.u8)('accountType'),
    (0, borsh_1.publicKey)('manager'),
    (0, borsh_1.publicKey)('staker'),
    (0, borsh_1.publicKey)('stakeDepositAuthority'),
    (0, borsh_1.u8)('stakeWithdrawBumpSeed'),
    (0, borsh_1.publicKey)('validatorList'),
    (0, borsh_1.publicKey)('reserveStake'),
    (0, borsh_1.publicKey)('poolMint'),
    (0, borsh_1.publicKey)('managerFeeAccount'),
    (0, borsh_1.publicKey)('tokenProgramId'),
    (0, borsh_1.u64)('totalLamports'),
    (0, borsh_1.u64)('poolTokenSupply'),
    (0, borsh_1.u64)('lastUpdateEpoch'),
]);
exports.ClockLayout = (0, borsh_1.struct)([
    (0, borsh_1.u64)('slot'),
    (0, borsh_1.i64)('epochStartTimestamp'),
    (0, borsh_1.u64)('epoch'),
    (0, borsh_1.u64)('leaderScheduleEpoch'),
    (0, borsh_1.i64)('unixTimestamp'),
]);
var ActivationType;
(function (ActivationType) {
    ActivationType[ActivationType["Slot"] = 0] = "Slot";
    ActivationType[ActivationType["Timestamp"] = 1] = "Timestamp";
})(ActivationType || (exports.ActivationType = ActivationType = {}));
//# sourceMappingURL=index.js.map
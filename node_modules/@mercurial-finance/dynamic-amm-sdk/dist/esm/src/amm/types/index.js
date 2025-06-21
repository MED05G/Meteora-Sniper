import { publicKey, struct, u64, u8, i64 } from '@coral-xyz/borsh';
export var AccountType;
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
})(AccountType || (AccountType = {}));
export const StakePoolLayout = struct([
    u8('accountType'),
    publicKey('manager'),
    publicKey('staker'),
    publicKey('stakeDepositAuthority'),
    u8('stakeWithdrawBumpSeed'),
    publicKey('validatorList'),
    publicKey('reserveStake'),
    publicKey('poolMint'),
    publicKey('managerFeeAccount'),
    publicKey('tokenProgramId'),
    u64('totalLamports'),
    u64('poolTokenSupply'),
    u64('lastUpdateEpoch'),
]);
export const ClockLayout = struct([
    u64('slot'),
    i64('epochStartTimestamp'),
    u64('epoch'),
    u64('leaderScheduleEpoch'),
    i64('unixTimestamp'),
]);
export var ActivationType;
(function (ActivationType) {
    ActivationType[ActivationType["Slot"] = 0] = "Slot";
    ActivationType[ActivationType["Timestamp"] = 1] = "Timestamp";
})(ActivationType || (ActivationType = {}));
//# sourceMappingURL=index.js.map
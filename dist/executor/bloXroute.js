"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTraderAPITipTransaction = CreateTraderAPITipTransaction;
exports.bloXroute_executeAndConfirm = bloXroute_executeAndConfirm;
const solana_trader_client_ts_1 = require("@bloxroute/solana-trader-client-ts");
const web3_js_1 = require("@solana/web3.js");
const web3_js_2 = require("@solana/web3.js");
const constants_1 = require("../constants");
const TRADER_API_TIP_WALLET = "HWEoBxYs7ssKuudEjzjmpfJVX7Dvi7wescFsVx2L5yoY";
let provider = null;
if (constants_1.BLOXROUTE_MODE) {
    try {
        provider = new solana_trader_client_ts_1.HttpProvider(constants_1.BLOXROUTE_AUTH_HEADER || '', constants_1.PRIVATE_KEY || '', solana_trader_client_ts_1.MAINNET_API_NY_HTTP // or MAINNET_API_NY_HTTP
        );
    }
    catch (e) {
        console.error("Error initializing BloXroute HttpProvider:", e);
        provider = null; // Ensure provider is null if initialization fails
    }
}
async function CreateTraderAPITipTransaction(senderAddress, tipAmountInLamports) {
    const tipAddress = new web3_js_1.PublicKey(TRADER_API_TIP_WALLET);
    return new web3_js_2.Transaction().add(web3_js_1.SystemProgram.transfer({
        fromPubkey: senderAddress,
        toPubkey: tipAddress,
        lamports: tipAmountInLamports,
    }));
}
async function bloXroute_executeAndConfirm(tx, wallet) {
    if (!provider) {
        console.error("BloXroute provider not initialized. Skipping transaction.");
        return false;
    }
    const fee = constants_1.BLOXROUTE_FEE;
    tx.add(await CreateTraderAPITipTransaction(wallet.publicKey, (fee) * web3_js_1.LAMPORTS_PER_SOL)); // why 0.001 SOL?
    tx.sign(wallet);
    const serializeTxBytes = tx.serialize();
    const buffTx = Buffer.from(serializeTxBytes);
    const encodedTx = buffTx.toString("base64");
    const request = {
        transaction: { content: encodedTx, isCleanup: false },
        frontRunningProtection: false,
        useStakedRPCs: true, // comment this line if you don\\'t want to directly send txn to current blockleader
    };
    const response = await provider.postSubmit(request);
    if (response.signature) {
        return response.signature.toString();
    }
    else {
        return false;
    }
}
module.exports = { bloXroute_executeAndConfirm };

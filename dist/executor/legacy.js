"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = void 0;
const web3_js_1 = require("@solana/web3.js");
const constants_1 = require("../constants");
const execute = async (transaction, latestBlockhash, isBuy = true) => {
    const solanaConnection = new web3_js_1.Connection(constants_1.RPC_ENDPOINT, {
        wsEndpoint: constants_1.RPC_WEBSOCKET_ENDPOINT,
    });
    const signature = await solanaConnection.sendRawTransaction(transaction.serialize(), { skipPreflight: true });
    const confirmation = await solanaConnection.confirmTransaction({
        signature,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        blockhash: latestBlockhash.blockhash,
    });
    if (confirmation.value.err) {
        console.log("Confirmtaion error");
        return "";
    }
    else {
        if (isBuy === 1) {
            return signature;
        }
        else if (isBuy)
            console.log(`Success in buy transaction: https://solscan.io/tx/${signature}`);
        else
            console.log(`Success in Sell transaction: https://solscan.io/tx/${signature}`);
    }
    return signature;
};
exports.execute = execute;

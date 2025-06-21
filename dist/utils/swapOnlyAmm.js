"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSellTxWithJupiter = exports.getBuyInStructionsWithJupiter = exports.getBuyTxWithJupiter = void 0;
const web3_js_1 = require("@solana/web3.js");
const constants_1 = require("../constants");
const getBuyTxWithJupiter = async (wallet, baseMint, amount) => {
    try {
        const quoteResponse = await (await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=${baseMint.toBase58()}&amount=${amount * web3_js_1.LAMPORTS_PER_SOL}&slippageBps=${constants_1.SLIPPAGE}`)).json();
        // get serialized transactions for the swap
        const { swapTransaction } = await (await fetch("https://quote-api.jup.ag/v6/swap", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                quoteResponse,
                userPublicKey: wallet.publicKey.toString(),
                wrapAndUnwrapSol: true,
                dynamicComputeUnitLimit: true,
                prioritizationFeeLamports: constants_1.PRIORITY_FEE * web3_js_1.LAMPORTS_PER_SOL
            }),
        })).json();
        // deserialize the transaction
        const swapTransactionBuf = Buffer.from(swapTransaction, "base64");
        var transaction = web3_js_1.VersionedTransaction.deserialize(swapTransactionBuf);
        // sign the transaction
        transaction.sign([wallet]);
        return transaction;
    }
    catch (error) {
        console.log("Failed to get buy transaction");
        return null;
    }
};
exports.getBuyTxWithJupiter = getBuyTxWithJupiter;
const getBuyInStructionsWithJupiter = async (wallet, baseMint, amount) => {
    try {
        const quoteResponse = await (await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=${baseMint.toBase58()}&amount=${amount * web3_js_1.LAMPORTS_PER_SOL}&slippageBps=${constants_1.SLIPPAGE}`)).json();
        // get serialized transactions for the swap
        const { setupInstructions, addressLookupTableAddresses } = await (await fetch("https://quote-api.jup.ag/v6/swap-instructions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                quoteResponse,
                userPublicKey: wallet.publicKey.toString(),
                wrapAndUnwrapSol: true,
                dynamicComputeUnitLimit: true,
                prioritizationFeeLamports: 100000
            }),
        })).json();
        return { setupInstructions, addressLookupTableAddresses };
    }
    catch (error) {
        console.log("Failed to get buy transaction");
        return null;
    }
};
exports.getBuyInStructionsWithJupiter = getBuyInStructionsWithJupiter;
const getSellTxWithJupiter = async (wallet, baseMint, amount) => {
    try {
        const quoteResponse = await (await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=${baseMint.toBase58()}&outputMint=So11111111111111111111111111111111111111112&amount=${amount}&slippageBps=${constants_1.SLIPPAGE}`)).json();
        // get serialized transactions for the swap
        const { swapTransaction } = await (await fetch("https://quote-api.jup.ag/v6/swap", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                quoteResponse,
                userPublicKey: wallet.publicKey.toString(),
                wrapAndUnwrapSol: true,
                dynamicComputeUnitLimit: true,
                prioritizationFeeLamports: 52000
            }),
        })).json();
        // deserialize the transaction
        const swapTransactionBuf = Buffer.from(swapTransaction, "base64");
        var transaction = web3_js_1.VersionedTransaction.deserialize(swapTransactionBuf);
        // sign the transaction
        transaction.sign([wallet]);
        return transaction;
    }
    catch (error) {
        console.log("Failed to get sell transaction", error);
        return null;
    }
};
exports.getSellTxWithJupiter = getSellTxWithJupiter;

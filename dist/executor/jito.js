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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jitoWithAxios = void 0;
const web3_js_1 = require("@solana/web3.js");
const bs58_1 = __importDefault(require("bs58"));
const axios_1 = __importStar(require("axios"));
const constants_1 = require("../constants");
const jitoWithAxios = async (transactions, payer, solanaConnection) => {
    console.log('Starting Jito transaction execution...');
    const tipAccounts = [
        'Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY',
        'DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL',
        '96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5',
        '3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT',
        'HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe',
        'ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49',
        'ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt',
        'DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh',
    ];
    const jitoFeeWallet = new web3_js_1.PublicKey(tipAccounts[Math.floor(tipAccounts.length * Math.random())]);
    try {
        console.log(`Calculated fee: ${constants_1.JITO_FEE} sol`);
        let latestBlockhash = await solanaConnection.getLatestBlockhash();
        const jitTipTxFeeMessage = new web3_js_1.TransactionMessage({
            payerKey: payer.publicKey,
            recentBlockhash: latestBlockhash.blockhash,
            instructions: [
                web3_js_1.SystemProgram.transfer({
                    fromPubkey: payer.publicKey,
                    toPubkey: jitoFeeWallet,
                    lamports: constants_1.JITO_FEE * web3_js_1.LAMPORTS_PER_SOL,
                }),
            ],
        }).compileToV0Message();
        const jitoFeeTx = new web3_js_1.VersionedTransaction(jitTipTxFeeMessage);
        jitoFeeTx.sign([payer]);
        const jitoTxsignature = bs58_1.default.encode(jitoFeeTx.signatures[0]);
        // Serialize the transactions once here
        const serializedjitoFeeTx = bs58_1.default.encode(jitoFeeTx.serialize());
        const serializedTransactions = [serializedjitoFeeTx];
        for (let i = 0; i < transactions.length; i++) {
            const serializedTransaction = bs58_1.default.encode(transactions[i].serialize());
            serializedTransactions.push(serializedTransaction);
        }
        const endpoints = [
            // 'https://mainnet.block-engine.jito.wtf/api/v1/bundles',
            // 'https://amsterdam.mainnet.block-engine.jito.wtf/api/v1/bundles',
            // 'https://frankfurt.mainnet.block-engine.jito.wtf/api/v1/bundles',
            // 'https://ny.mainnet.block-engine.jito.wtf/api/v1/bundles',
            'https://tokyo.mainnet.block-engine.jito.wtf/api/v1/bundles',
        ];
        const requests = endpoints.map((url) => axios_1.default.post(url, {
            jsonrpc: '2.0',
            id: 1,
            method: 'sendBundle',
            params: [serializedTransactions],
        }));
        // const requests =await axios.post(endpoints[0], {
        //   jsonrpc: '2.0',
        //   id: 1,
        //   method: 'sendBundle',
        //   params: [serializedTransactions],
        // })
        const results = await Promise.all(requests.map((p) => p.catch((e) => e)));
        const successfulResults = results.filter((result) => !(result instanceof Error));
        if (successfulResults.length > 0) {
            console.log(`Confirming jito transaction...`);
            const latestBlockhash1 = await solanaConnection.getLatestBlockhash();
            const confirmation = await solanaConnection.confirmTransaction({
                signature: jitoTxsignature,
                lastValidBlockHeight: latestBlockhash1.lastValidBlockHeight,
                blockhash: latestBlockhash1.blockhash,
            }, "confirmed");
            console.log(confirmation);
            return { confirmed: !confirmation.value.err, jitoTxsignature };
        }
        else {
            console.log(`No successful responses received for jito`);
        }
        return { confirmed: false };
    }
    catch (error) {
        if (error instanceof axios_1.AxiosError) {
            console.log('Failed to execute jito transaction');
        }
        console.log('Error during transaction execution', error);
        return { confirmed: false };
    }
};
exports.jitoWithAxios = jitoWithAxios;

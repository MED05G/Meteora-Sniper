"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchPoolOnMeteoraDYN = exports.getTokenPriceJup = exports.fetchTokenAccountBalanceWithRetry = exports.getLiquidity = exports.getMarketCap = exports.sellOnMeteoraDYN = exports.swapOnMeteoraDYN = exports.buildVersionedTx = exports.swapOnMeteora = exports.getDlmmPool = exports.PROGRAM_ID = exports.DEFAULT_FINALITY = exports.DEFAULT_COMMITMENT = void 0;
const dlmm_1 = __importDefault(require("@meteora-ag/dlmm"));
const anchor_1 = require("@coral-xyz/anchor");
const dynamic_amm_sdk_1 = __importDefault(require("@mercurial-finance/dynamic-amm-sdk"));
const idl_1 = require("./idl");
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = __importDefault(require("bn.js"));
const spl_token_1 = require("@solana/spl-token");
const constants_1 = require("../constants");
const jito_1 = require("../executor/jito");
const bloXroute_1 = require("../executor/bloXroute");
const axios_1 = __importDefault(require("axios"));
exports.DEFAULT_COMMITMENT = "finalized";
exports.DEFAULT_FINALITY = "finalized";
exports.PROGRAM_ID = 'Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB';
const getDlmmPool = async (connection, poolId) => {
    try {
        const poolKey = new web3_js_1.PublicKey(poolId);
        const dlmmPool = await dlmm_1.default.create(connection, poolKey);
        return dlmmPool;
    }
    catch (error) {
        return null;
    }
};
exports.getDlmmPool = getDlmmPool;
const swapOnMeteora = async (connection, wallet, amount, swapForY, poolId) => {
    try {
        const poolKey = new web3_js_1.PublicKey(poolId);
        const dlmmPool = await dlmm_1.default.create(connection, poolKey);
        const swapAmount = new bn_js_1.default(amount * web3_js_1.LAMPORTS_PER_SOL);
        const binArrays = await dlmmPool.getBinArrayForSwap(swapForY);
        const tokenY = dlmmPool.tokenY.publicKey.toBase58();
        if (tokenY !== spl_token_1.NATIVE_MINT.toBase58()) {
            console.log('Token Y : ', tokenY);
            console.log("Y token is not wsol! Going to skip!");
            return false;
        }
        const swapQuote = dlmmPool.swapQuote(swapAmount, swapForY, new bn_js_1.default(10000), binArrays);
        const transaction = await dlmmPool.swap({
            inToken: swapForY ? dlmmPool.tokenX.publicKey : dlmmPool.tokenY.publicKey,
            binArraysPubkey: swapQuote.binArraysPubkey,
            inAmount: swapAmount,
            lbPair: dlmmPool.pubkey,
            user: wallet.publicKey,
            minOutAmount: swapQuote.minOutAmount,
            outToken: swapForY ? dlmmPool.tokenY.publicKey : dlmmPool.tokenX.publicKey,
        });
        if (constants_1.JITO_MODE) {
            const latestBlockhash = await connection.getLatestBlockhash();
            const messageV0 = new web3_js_1.TransactionMessage({
                payerKey: wallet.publicKey,
                recentBlockhash: latestBlockhash.blockhash,
                instructions: [...transaction.instructions]
            }).compileToV0Message();
            const vTransaction = new web3_js_1.VersionedTransaction(messageV0);
            const sig = await (0, jito_1.jitoWithAxios)([vTransaction], wallet, connection);
            if (sig.confirmed) {
                return sig.jitoTxsignature;
            }
            else {
                return false;
            }
        }
        else if (constants_1.NEXTBLOCK_MODE) {
            const next_block_addrs = [
                'NEXTbLoCkB51HpLBLojQfpyVAMorm3zzKg7w9NFdqid',
                'NeXTBLoCKs9F1y5PJS9CKrFNNLU1keHW71rfh7KgA1X',
                'NexTBLockJYZ7QD7p2byrUa6df8ndV2WSd8GkbWqfbb',
                'neXtBLock1LeC67jYd1QdAa32kbVeubsfPNTJC1V5At',
                'nEXTBLockYgngeRmRrjDV31mGSekVPqZoMGhQEZtPVG',
                'nextBLoCkPMgmG8ZgJtABeScP35qLa2AMCNKntAP7Xc',
                'NextbLoCkVtMGcV47JzewQdvBpLqT9TxQFozQkN98pE',
                'NexTbLoCkWykbLuB1NkjXgFWkX9oAtcoagQegygXXA2'
            ];
            for (let i = 0; i < next_block_addrs.length; i++) {
                const next_block_addr = next_block_addrs[i];
                if (!next_block_addr)
                    return console.log("Nextblock wallet is not provided");
                if (!constants_1.NEXT_BLOCK_API)
                    return console.log("Nextblock block api is not provided");
                // NextBlock Instruction
                const recipientPublicKey = new web3_js_1.PublicKey(next_block_addr);
                const transferInstruction = web3_js_1.SystemProgram.transfer({
                    fromPubkey: wallet.publicKey,
                    toPubkey: recipientPublicKey,
                    lamports: constants_1.NEXT_BLOCK_FEE * web3_js_1.LAMPORTS_PER_SOL
                });
                transaction.add(transferInstruction);
                transaction.sign(wallet);
                const tx64Str = transaction.serialize().toString('base64');
                const payload = {
                    transaction: {
                        content: tx64Str
                    }
                };
                try {
                    const response = await fetch('https://fra.nextblock.io/api/v2/submit', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'authorization': constants_1.NEXT_BLOCK_API // Insert your authorization token here
                        },
                        body: JSON.stringify(payload)
                    });
                    const responseData = await response.json();
                    if (response.ok) {
                        return responseData.signature?.toString();
                    }
                    else {
                        console.error("Failed to send transaction:", response.status, responseData);
                        return false;
                    }
                }
                catch (error) {
                    console.error("Error sending transaction:", error);
                    return false;
                }
            }
        }
        else if (constants_1.BLOXROUTE_MODE) {
            const result = await (0, bloXroute_1.bloXroute_executeAndConfirm)(transaction, wallet);
            if (result) {
                return result;
            }
            else {
                return false;
            }
        }
        else {
            const swapTxHash = await (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [
                wallet,
            ]);
            return swapTxHash;
        }
    }
    catch (error) {
        return null;
    }
};
exports.swapOnMeteora = swapOnMeteora;
const buildVersionedTx = async (connection, payer, tx, commitment = exports.DEFAULT_COMMITMENT) => {
    const blockHash = (await connection.getLatestBlockhash(commitment)).blockhash;
    let messageV0 = new web3_js_1.TransactionMessage({
        payerKey: payer,
        recentBlockhash: blockHash,
        instructions: tx.instructions,
    }).compileToV0Message();
    return new web3_js_1.VersionedTransaction(messageV0);
};
exports.buildVersionedTx = buildVersionedTx;
const swapOnMeteoraDYN = async (connection, poolAddress, wallet, swapAmount, swapAtoB, toWallet, slippage) => {
    try {
        const mockWallet = new anchor_1.Wallet(wallet);
        const provider = new anchor_1.AnchorProvider(connection, mockWallet, {
            commitment: 'confirmed',
        });
        const ammProgram = new anchor_1.Program(idl_1.IDL, exports.PROGRAM_ID, provider);
        let poolState = await ammProgram.account.pool.fetch(poolAddress);
        const pool = await dynamic_amm_sdk_1.default.create(provider.connection, poolAddress);
        let inTokenMint = swapAtoB ? poolState.tokenAMint : poolState.tokenBMint;
        let outTokenMint = swapAtoB ? poolState.tokenBMint : poolState.tokenAMint;
        let swapQuote = pool.getSwapQuote(inTokenMint, swapAmount, slippage);
        const transaction = await pool.swap(mockWallet.publicKey, inTokenMint, swapAmount, swapQuote.minSwapOutAmount);
        console.log(await connection.simulateTransaction(transaction));
        let buySig;
        if (constants_1.JITO_MODE) {
            const latestBlockhash = await connection.getLatestBlockhash();
            const messageV0 = new web3_js_1.TransactionMessage({
                payerKey: wallet.publicKey,
                recentBlockhash: latestBlockhash.blockhash,
                instructions: [...transaction.instructions]
            }).compileToV0Message();
            const vTransaction = new web3_js_1.VersionedTransaction(messageV0);
            const sig = await (0, jito_1.jitoWithAxios)([vTransaction], wallet, connection);
            if (sig.confirmed) {
                buySig = sig.jitoTxsignature;
            }
            else {
                return false;
            }
        }
        else if (constants_1.NEXTBLOCK_MODE) {
            const next_block_addrs = [
                'NEXTbLoCkB51HpLBLojQfpyVAMorm3zzKg7w9NFdqid',
            ];
            for (let i = 0; i < next_block_addrs.length; i++) {
                const next_block_addr = next_block_addrs[i];
                if (!next_block_addr)
                    return console.log("Nextblock wallet is not provided");
                if (!constants_1.NEXT_BLOCK_API)
                    return console.log("Nextblock block api is not provided");
                const recipientPublicKey = new web3_js_1.PublicKey(next_block_addr);
                const transferInstruction = web3_js_1.SystemProgram.transfer({
                    fromPubkey: wallet.publicKey,
                    toPubkey: recipientPublicKey,
                    lamports: constants_1.NEXT_BLOCK_FEE * web3_js_1.LAMPORTS_PER_SOL
                });
                transaction.add(transferInstruction);
                transaction.sign(wallet);
                const tx64Str = transaction.serialize().toString('base64');
                const payload = {
                    transaction: {
                        content: tx64Str
                    }
                };
                try {
                    const response = await fetch('https://fra.nextblock.io/api/v2/submit', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'authorization': constants_1.NEXT_BLOCK_API
                        },
                        body: JSON.stringify(payload)
                    });
                    const responseData = await response.json();
                    if (response.ok) {
                        buySig = responseData.signature?.toString();
                    }
                    else {
                        console.error("Failed to send transaction:", response.status, responseData);
                        return false;
                    }
                }
                catch (error) {
                    console.error("Error sending transaction:", error);
                    return false;
                }
            }
        }
        else if (constants_1.BLOXROUTE_MODE) {
            const result = await (0, bloXroute_1.bloXroute_executeAndConfirm)(transaction, wallet);
            if (result) {
                buySig = result;
            }
            else {
                return false;
            }
        }
        else {
            const swapTxHash = await (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [
                wallet,
            ]);
            buySig = swapTxHash;
        }
        const fromWalletAta = (0, spl_token_1.getAssociatedTokenAddressSync)(outTokenMint, wallet.publicKey);
        const info = await (0, exports.fetchTokenAccountBalanceWithRetry)(connection, fromWalletAta);
        console.log("🚀 ~ swapOnMeteoraDYN ~ info:", info);
        const tokenBalance = info.value.amount;
        if (!tokenBalance)
            return console.log("No Token Balance!");
        const sendTokenTx = new web3_js_1.Transaction();
        const toWalletAta = (0, spl_token_1.getAssociatedTokenAddressSync)(outTokenMint, toWallet);
        if (!await connection.getAccountInfo(toWalletAta)) {
            sendTokenTx.add((0, spl_token_1.createAssociatedTokenAccountInstruction)(wallet.publicKey, toWalletAta, toWallet, outTokenMint));
        }
        sendTokenTx.add((0, spl_token_1.createTransferInstruction)(fromWalletAta, toWalletAta, wallet.publicKey, Number(tokenBalance)));
        const latestBlockHash = await connection.getLatestBlockhash('confirmed');
        sendTokenTx.recentBlockhash = latestBlockHash.blockhash;
        sendTokenTx.feePayer = wallet.publicKey;
        console.log(await connection.simulateTransaction(sendTokenTx));
        const signature = await (0, web3_js_1.sendAndConfirmTransaction)(connection, sendTokenTx, [wallet]);
        return signature;
    }
    catch (error) {
        console.log("🚀 ~ swapOnMeteoraDYN ~ error:", error);
        return null;
    }
};
exports.swapOnMeteoraDYN = swapOnMeteoraDYN;
const sellOnMeteoraDYN = async (connection, poolAddress, wallet, sellAmount, swapAtoB, // true if selling tokenA for tokenB (wSOL), false if selling tokenB for tokenA
toWallet, slippage) => {
    try {
        const mockWallet = new anchor_1.Wallet(wallet);
        const provider = new anchor_1.AnchorProvider(connection, mockWallet, {
            commitment: 'confirmed',
        });
        const ammProgram = new anchor_1.Program(idl_1.IDL, exports.PROGRAM_ID, provider);
        let poolState = await ammProgram.account.pool.fetch(poolAddress);
        const pool = await dynamic_amm_sdk_1.default.create(provider.connection, poolAddress);
        // Determine input and output mints for selling
        // If swapAtoB is true, we are selling tokenA (inTokenMint) to get tokenB (outTokenMint)
        // If swapAtoB is false, we are selling tokenB (inTokenMint) to get tokenA (outTokenMint)
        let inTokenMint = swapAtoB ? poolState.tokenAMint : poolState.tokenBMint;
        let outTokenMint = swapAtoB ? poolState.tokenBMint : poolState.tokenAMint;
        let swapQuote = pool.getSwapQuote(inTokenMint, sellAmount, slippage);
        const transaction = await pool.swap(mockWallet.publicKey, inTokenMint, sellAmount, swapQuote.minSwapOutAmount);
        console.log(await connection.simulateTransaction(transaction));
        let sellSig;
        if (constants_1.JITO_MODE) {
            const latestBlockhash = await connection.getLatestBlockhash();
            const messageV0 = new web3_js_1.TransactionMessage({
                payerKey: wallet.publicKey,
                recentBlockhash: latestBlockhash.blockhash,
                instructions: [...transaction.instructions]
            }).compileToV0Message();
            const vTransaction = new web3_js_1.VersionedTransaction(messageV0);
            const sig = await (0, jito_1.jitoWithAxios)([vTransaction], wallet, connection);
            if (sig.confirmed) {
                sellSig = sig.jitoTxsignature;
            }
            else {
                return false;
            }
        }
        else if (constants_1.NEXTBLOCK_MODE) {
            const next_block_addrs = [
                'NEXTbLoCkB51HpLBLojQfpyVAMorm3zzKg7w9NFdqid',
            ];
            for (let i = 0; i < next_block_addrs.length; i++) {
                const next_block_addr = next_block_addrs[i];
                if (!next_block_addr)
                    return console.log("Nextblock wallet is not provided");
                if (!constants_1.NEXT_BLOCK_API)
                    return console.log("Nextblock block api is not provided");
                const recipientPublicKey = new web3_js_1.PublicKey(next_block_addr);
                const transferInstruction = web3_js_1.SystemProgram.transfer({
                    fromPubkey: wallet.publicKey,
                    toPubkey: recipientPublicKey,
                    lamports: constants_1.NEXT_BLOCK_FEE * web3_js_1.LAMPORTS_PER_SOL
                });
                transaction.add(transferInstruction);
                transaction.sign(wallet);
                const tx64Str = transaction.serialize().toString('base64');
                const payload = {
                    transaction: {
                        content: tx64Str
                    }
                };
                try {
                    const response = await fetch('https://fra.nextblock.io/api/v2/submit', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'authorization': constants_1.NEXT_BLOCK_API
                        },
                        body: JSON.stringify(payload)
                    });
                    const responseData = await response.json();
                    if (response.ok) {
                        sellSig = responseData.signature?.toString();
                    }
                    else {
                        console.error("Failed to send transaction:", response.status, responseData);
                        return false;
                    }
                }
                catch (error) {
                    console.error("Error sending transaction:", error);
                    return false;
                }
            }
        }
        else if (constants_1.BLOXROUTE_MODE) {
            const result = await (0, bloXroute_1.bloXroute_executeAndConfirm)(transaction, wallet);
            if (result) {
                sellSig = result;
            }
            else {
                return false;
            }
        }
        else {
            const swapTxHash = await (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [
                wallet,
            ]);
            sellSig = swapTxHash;
        }
        const fromWalletAta = (0, spl_token_1.getAssociatedTokenAddressSync)(outTokenMint, wallet.publicKey);
        const info = await (0, exports.fetchTokenAccountBalanceWithRetry)(connection, fromWalletAta);
        console.log("🚀 ~ sellOnMeteoraDYN ~ info:", info);
        const tokenBalance = info.value.amount;
        if (!tokenBalance)
            return console.log("No Token Balance!");
        const sendTokenTx = new web3_js_1.Transaction();
        const toWalletAta = (0, spl_token_1.getAssociatedTokenAddressSync)(outTokenMint, toWallet);
        if (!await connection.getAccountInfo(toWalletAta)) {
            sendTokenTx.add((0, spl_token_1.createAssociatedTokenAccountInstruction)(wallet.publicKey, toWalletAta, toWallet, outTokenMint));
        }
        sendTokenTx.add((0, spl_token_1.createTransferInstruction)(fromWalletAta, toWalletAta, wallet.publicKey, Number(tokenBalance)));
        const latestBlockHash = await connection.getLatestBlockhash('confirmed');
        sendTokenTx.recentBlockhash = latestBlockHash.blockhash;
        sendTokenTx.feePayer = wallet.publicKey;
        console.log(await connection.simulateTransaction(sendTokenTx));
        const signature = await (0, web3_js_1.sendAndConfirmTransaction)(connection, sendTokenTx, [wallet]);
        return signature;
    }
    catch (error) {
        console.log("🚀 ~ sellOnMeteoraDYN ~ error:", error);
        return null;
    }
};
exports.sellOnMeteoraDYN = sellOnMeteoraDYN;
const getMarketCap = async (connection, wallet, tokenMintAddress) => {
    try {
        const tokenMintInfo = await (0, spl_token_1.getMint)(connection, tokenMintAddress);
        const totalSupply = tokenMintInfo.supply;
        const decimals = tokenMintInfo.decimals;
        // Get the current price of the token in SOL
        const tokenPriceInSol = await (0, exports.getTokenPriceJup)(tokenMintAddress.toBase58());
        if (!tokenPriceInSol) {
            console.log(`Could not fetch price for token: ${tokenMintAddress.toBase58()}`);
            return null;
        }
        // Get the current price of SOL in USD
        const solPriceUSD = await (0, exports.getTokenPriceJup)('So11111111111111111111111111111111111111112');
        if (!solPriceUSD) {
            console.log("Could not fetch SOL price.");
            return null;
        }
        // Calculate market cap in USD
        const totalSupplyAdjusted = Number(totalSupply) / (10 ** decimals);
        const marketCapUSD = totalSupplyAdjusted * tokenPriceInSol * solPriceUSD;
        return marketCapUSD;
    }
    catch (error) {
        console.error("Error fetching market cap:", error);
        return null;
    }
};
exports.getMarketCap = getMarketCap;
const getLiquidity = async (connection, wallet, poolAddress) => {
    try {
        const mockWallet = new anchor_1.Wallet(wallet);
        const provider = new anchor_1.AnchorProvider(connection, mockWallet, {
            commitment: 'confirmed',
        });
        const ammProgram = new anchor_1.Program(idl_1.IDL, exports.PROGRAM_ID, provider);
        let poolState = await ammProgram.account.pool.fetch(poolAddress);
        // Assuming tokenBMint is wSOL (or a stablecoin) for liquidity calculation
        // This needs to be robust based on how Meteora pools are structured.
        // For now, we'll assume the liquidity is represented by the balance of tokenB if tokenB is wSOL.
        // A more accurate approach would be to sum the value of both tokens in the pool.
        const tokenBMint = poolState.tokenBMint;
        const tokenBAccount = (0, spl_token_1.getAssociatedTokenAddressSync)(tokenBMint, poolAddress, true); // true for allowOwnerOffCurve
        const tokenBBalance = await connection.getTokenAccountBalance(tokenBAccount);
        if (tokenBBalance.value.uiAmount === null) {
            console.log("Could not get token B balance for liquidity calculation.");
            return null;
        }
        // Convert token B amount to SOL value if token B is wSOL
        if (tokenBMint.toBase58() === 'So11111111111111111111111111111111111111112') { // wSOL mint address
            return tokenBBalance.value.uiAmount;
        }
        else {
            // If token B is not wSOL, we need to convert its value to SOL
            const tokenBPriceInSol = await (0, exports.getTokenPriceJup)(tokenBMint.toBase58());
            if (tokenBPriceInSol) {
                return tokenBBalance.value.uiAmount * tokenBPriceInSol;
            }
            else {
                console.log(`Could not get price for token B: ${tokenBMint.toBase58()} to calculate liquidity in SOL.`);
                return null;
            }
        }
    }
    catch (error) {
        console.error("Error fetching liquidity:", error);
        return null;
    }
};
exports.getLiquidity = getLiquidity;
const fetchTokenAccountBalanceWithRetry = async (connection, tokenAccount, retries = 5, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            const info = await connection.getTokenAccountBalance(tokenAccount);
            if (info.value.amount !== undefined) {
                return info;
            }
        }
        catch (error) {
            console.warn(`Attempt ${i + 1} failed to fetch token account balance:`, error);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    throw new Error(`Failed to fetch token account balance after ${retries} retries.`);
};
exports.fetchTokenAccountBalanceWithRetry = fetchTokenAccountBalanceWithRetry;
const getTokenPriceJup = async (mintAddress) => {
    try {
        const response = await axios_1.default.get(`https://price.jup.ag/v4/price?ids=${mintAddress}`);
        if (response.data && response.data.data && response.data.data[mintAddress]) {
            return response.data.data[mintAddress].price;
        }
        return null;
    }
    catch (error) {
        console.error(`Error fetching price for ${mintAddress} from Jupiter:`, error);
        return null;
    }
};
exports.getTokenPriceJup = getTokenPriceJup;
const fetchPoolOnMeteoraDYN = async (connection, mint, wallet) => {
    // This function is now deprecated as we are using Shyft API for LP discovery.
    // It might be used internally by other Meteora SDK functions, but not for initial LP discovery.
    // For now, we return null as it's no longer the primary method for finding pools.
    return null;
};
exports.fetchPoolOnMeteoraDYN = fetchPoolOnMeteoraDYN;

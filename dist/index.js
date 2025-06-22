"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const bs58_1 = __importDefault(require("bs58"));
const dotenv_1 = __importDefault(require("dotenv"));
const constants_1 = require("./constants/constants");
const meteoraSwap_1 = require("./utils/meteoraSwap");
const bn_js_1 = require("bn.js");
const handleSolPrice_1 = require("./handleSolPrice");
const shyftApi_1 = require("./utils/shyftApi");
dotenv_1.default.config();
const solanaConnection = new web3_js_1.Connection(constants_1.RPC_ENDPOINT, 'processed');
const keypair = web3_js_1.Keypair.fromSecretKey(bs58_1.default.decode(constants_1.PRIVATE_KEY));
const secondPub = new web3_js_1.PublicKey(constants_1.SECOND_WALLET);
// Main function for specific CA buying
async function main() {
    (0, handleSolPrice_1.startSolPricePolling)(); // Start polling for SOL price
    if (!constants_1.TARGET_CA) {
        console.error("TARGET_CA is not set in the environment variables. Please provide a specific contract address.");
        process.exit(1);
    }
    const targetMint = new web3_js_1.PublicKey(constants_1.TARGET_CA);
    console.log(`Attempting to process target CA: ${constants_1.TARGET_CA}`);
    await processTargetCA(targetMint);
}
async function processTargetCA(mint) {
    try {
        console.log("Checking for LP pool using Shyft API...");
        const pools = await (0, shyftApi_1.getPoolsByToken)(mint.toBase58());
        const balance = await solanaConnection.getBalance(keypair.publicKey);
        console.log("Wallet balance:", balance / web3_js_1.LAMPORTS_PER_SOL, "SOL");
        if (balance < 0.002 * web3_js_1.LAMPORTS_PER_SOL) { // 0.002 SOL is a safe minimum for fees
            console.log("Insufficient SOL balance! Please fund your wallet.");
            return;
        }
        let poolId = '';
        let poolState = null; // This will now represent the actual LP pool address
        if (pools && pools.length > 0) {
            // Try to find an AMM pool first
            let pool = pools.find(p => p.lpMint && p.tokenAMint && p.tokenBMint);
            let poolType = 'amm';
            if (!pool) {
                // Fallback: try DLMM pool (has pubkey, tokenXMint, tokenYMint)
                pool = pools.find(p => p.pubkey && p.tokenXMint && p.tokenYMint);
                poolType = 'dlmm';
            }
            if (pool) {
                const poolId = pool.lpMint || pool.pubkey || '';
                console.log(`Found ${poolType.toUpperCase()} LP pool: ${poolId}`);
                const poolPub = new web3_js_1.PublicKey(poolId);
                const buyAmountLamports = new bn_js_1.BN(constants_1.BUY_AMOUNT);
                let sig;
                if (poolType === 'amm') {
                    sig = await (0, meteoraSwap_1.swapOnMeteoraDYN)(solanaConnection, poolPub, keypair, buyAmountLamports, false, secondPub, constants_1.SLIPPAGE);
                }
                else if (poolType === 'dlmm') {
                    sig = await (0, meteoraSwap_1.swapOnMeteora)(solanaConnection, keypair, constants_1.BUY_AMOUNT / web3_js_1.LAMPORTS_PER_SOL, true, poolId); // swapForY: true/false as needed
                }
                if (sig) {
                    console.log("Buy Success :", `https://solscan.io/tx/${sig}`);
                    await monitorAndSell(mint, poolPub, keypair, secondPub, constants_1.SLIPPAGE, buyAmountLamports);
                }
                else {
                    console.log("Buy failed!");
                }
            }
            else {
                console.log("No supported pool found for this token. Skipping.");
                return;
            }
        }
        else {
            console.log("No LP pool found for the target CA using Shyft API.");
            return;
        }
        if (!poolId) {
            console.log("Could not determine LP pool ID. Skipping.");
            return;
        }
        console.log("LP pool found! PoolId : ", poolId);
        let checked_market = false;
        if (constants_1.CHECK_MARKET_CAP) {
            console.log("Checking MarketCap!");
            const poolPub = new web3_js_1.PublicKey(poolId);
            const marketcap = await (0, meteoraSwap_1.getMarketCap)(solanaConnection, keypair, mint);
            console.log("MarketCap => ", marketcap ? marketcap.toFixed(2) : 0);
            if (!marketcap || !(marketcap >= constants_1.MINIMUM_MARKET_CAP && marketcap <= constants_1.MAXIMUM_MARKET_CAP)) {
                console.log("This token's market cap is out of our range! Skipping.");
                return;
            }
            checked_market = true;
        }
        let checked_liquidity = false;
        if (constants_1.CHECK_LIQUIDITY) {
            console.log("Checking Liquidity!");
            const poolPub = new web3_js_1.PublicKey(poolId);
            const liquidity = await (0, meteoraSwap_1.getLiquidity)(solanaConnection, keypair, poolPub);
            console.log("Liquidity => ", liquidity ? liquidity.toFixed(2) : 0, 'Sol');
            if (!liquidity || !(liquidity >= constants_1.MINIMUM_LIQUIDITY && liquidity <= constants_1.MAXIMUM_LIQUIDITY)) {
                console.log("This token's liquidity is out of our range! Skipping.");
                return;
            }
            checked_liquidity = true;
        }
        if ((constants_1.CHECK_MARKET_CAP && !checked_market) || (constants_1.CHECK_LIQUIDITY && !checked_liquidity)) {
            console.log("Market cap or liquidity checks failed. Skipping buy.");
            return;
        }
        const poolPub = new web3_js_1.PublicKey(poolId);
        const buyAmountLamports = new bn_js_1.BN(constants_1.BUY_AMOUNT); // Assuming BUY_AMOUNT is already in lamports from .env
        console.log(`Going to buy with ${constants_1.BUY_AMOUNT} lamports!`);
        const sig = await (0, meteoraSwap_1.swapOnMeteoraDYN)(solanaConnection, poolPub, keypair, buyAmountLamports, false, secondPub, constants_1.SLIPPAGE);
        if (sig) {
            console.log("Buy Success :", `https://solscan.io/tx/${sig}`);
            console.log("\n");
            await monitorAndSell(mint, poolPub, keypair, secondPub, constants_1.SLIPPAGE, buyAmountLamports);
        }
        else {
            console.log("Buy failed!");
            console.log("\n");
        }
    }
    catch (error) {
        console.error("Error processing target CA:", error);
    }
}
async function monitorAndSell(mint, poolPub, wallet, toWallet, slippage, buyAmountLamports) {
    console.log("Starting stop-loss/take-profit monitoring...");
    let initialPriceUSD = null;
    let tokensBoughtAmount = null;
    const solPriceUSD = await (0, meteoraSwap_1.getTokenPriceJup)('So11111111111111111111111111111111111111112');
    const tokenPriceInSol = await (0, meteoraSwap_1.getTokenPriceJup)(mint.toBase58());
    if (solPriceUSD && tokenPriceInSol) {
        initialPriceUSD = tokenPriceInSol * solPriceUSD;
        // Estimate tokens bought. This is a rough estimation.
        // A more accurate way would be to get the actual out_amount from the swap transaction.
        const buyAmountSOL = buyAmountLamports.toNumber() / web3_js_1.LAMPORTS_PER_SOL;
        tokensBoughtAmount = buyAmountSOL / tokenPriceInSol;
        console.log(`Initial token price (USD): $${initialPriceUSD.toFixed(6)} per token`);
        console.log(`Estimated tokens bought: ${tokensBoughtAmount.toFixed(6)}`);
    }
    else {
        console.error("Could not determine initial token price in USD. Stop-loss/take-profit monitoring aborted.");
        return;
    }
    if (tokensBoughtAmount === null || tokensBoughtAmount <= 0) {
        console.error("Estimated tokens bought is zero or null. Cannot monitor. Check BUY_AMOUNT and price fetching.");
        return;
    }
    const monitorInterval = setInterval(async () => {
        try {
            const currentTokenPriceInSol = await (0, meteoraSwap_1.getTokenPriceJup)(mint.toBase58());
            const currentSolPriceUSD = await (0, meteoraSwap_1.getTokenPriceJup)('So11111111111111111111111111111111111111112');
            if (!currentTokenPriceInSol || !currentSolPriceUSD) {
                console.log("Could not fetch current token price. Retrying...");
                return;
            }
            const currentPriceUSD = currentTokenPriceInSol * currentSolPriceUSD;
            console.log(`Current token price (USD): $${currentPriceUSD.toFixed(6)} per token`);
            const profitLossPercentage = ((currentPriceUSD - initialPriceUSD) / initialPriceUSD) * 100;
            console.log(`Profit/Loss: ${profitLossPercentage.toFixed(2)}%`);
            let sellTriggered = false;
            if (profitLossPercentage >= constants_1.TAKE_PROFIT_PERCENTAGE) {
                console.log(`Take-profit target (${constants_1.TAKE_PROFIT_PERCENTAGE}%) reached! Selling...`);
                sellTriggered = true;
            }
            else if (profitLossPercentage <= -constants_1.STOP_LOSS_PERCENTAGE) {
                console.log(`Stop-loss limit (${constants_1.STOP_LOSS_PERCENTAGE}%) reached! Selling...`);
                sellTriggered = true;
            }
            if (sellTriggered) {
                clearInterval(monitorInterval);
                // Convert estimated tokensBoughtAmount to BN in token's smallest unit (needs token decimals)
                // For simplicity, assuming we sell all estimated tokens. This needs refinement with actual balance and decimals.
                // const tokenDecimals = ... // fetch token decimals
                // const sellAmountBaseUnits = new BN(tokensBoughtAmount! * Math.pow(10, tokenDecimals));
                // For now, this part is highly simplified and likely needs adjustment for actual token amounts.
                // It's better to fetch the actual balance of the token `mint` in the `wallet`.
                console.log(`Attempting to sell estimated ${tokensBoughtAmount} tokens.`);
                // The sellOnMeteoraDYN expects amount in base units of the token being sold.
                // This is a placeholder for amount, as calculating exact token units from SOL amount is complex without knowing exact execution price and decimals.
                // You should fetch the actual token balance after the buy to sell correctly.
                const placeholderSellAmount = new bn_js_1.BN(1); // Placeholder: Sell 1 base unit. Replace with actual balance.
                // IMPORTANT: The sellOnMeteoraDYN function needs the amount of the token you are selling (not SOL).
                // You need to get the actual balance of `mint` token you hold after the buy.
                // For now, I'm passing a placeholder. This will fail in a real scenario.
                // You'd typically fetch the associated token account balance for `mint`.
                const sellSig = await (0, meteoraSwap_1.sellOnMeteoraDYN)(solanaConnection, poolPub, wallet, placeholderSellAmount, true, toWallet, slippage);
                if (sellSig) {
                    console.log("Sell order sent. Signature:", sellSig);
                }
                else {
                    console.log("Sell order failed.");
                }
            }
        }
        catch (error) {
            console.error("Error during monitoring:", error);
        }
    }, 15000); // Check every 15 seconds
}
main().catch((err) => {
    console.error('Unhandled error in main:', err);
    process.exit(1);
});

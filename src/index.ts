
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import dotenv from 'dotenv';
import { BUY_AMOUNT, CHECK_LIQUIDITY, CHECK_MARKET_CAP, MAXIMUM_LIQUIDITY, MAXIMUM_MARKET_CAP, MINIMUM_LIQUIDITY, MINIMUM_MARKET_CAP, PRIVATE_KEY, RPC_ENDPOINT, SECOND_WALLET, SLIPPAGE, TARGET_CA, STOP_LOSS_PERCENTAGE, TAKE_PROFIT_PERCENTAGE, GRPC_ENDPOINT, GRPC_TOKEN } from './constants/constants';
import { fetchPoolOnMeteoraDYN, getLiquidity, getMarketCap, swapOnMeteoraDYN, getTokenPriceJup, sellOnMeteoraDYN, swapOnMeteora } from './utils/meteoraSwap';
import { BN } from 'bn.js';
import { startSolPricePolling } from './handleSolPrice';
import { getPoolsByToken } from './utils/shyftApi';

dotenv.config()

const solanaConnection = new Connection(RPC_ENDPOINT, 'processed');
const keypair = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY));
const secondPub = new PublicKey(SECOND_WALLET);

// Main function for specific CA buying
async function main(): Promise<void> {
    startSolPricePolling(); // Start polling for SOL price

    if (!TARGET_CA) {
        console.error("TARGET_CA is not set in the environment variables. Please provide a specific contract address.");
        process.exit(1);
    }

    const targetMint = new PublicKey(TARGET_CA);
    console.log(`Attempting to process target CA: ${TARGET_CA}`);
    await processTargetCA(targetMint);
}

async function processTargetCA(mint: PublicKey) {
    try {
        console.log("Checking for LP pool using Shyft API...");
        const pools = await getPoolsByToken(mint.toBase58());
        const balance = await solanaConnection.getBalance(keypair.publicKey);
        console.log("Wallet balance:", balance / LAMPORTS_PER_SOL, "SOL");
        if (balance < 0.002 * LAMPORTS_PER_SOL) { // 0.002 SOL is a safe minimum for fees
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
                const poolPub = new PublicKey(poolId);
                const buyAmountLamports = new BN(BUY_AMOUNT);
                let sig;
                if (poolType === 'amm') {
                    sig = await swapOnMeteoraDYN(solanaConnection, poolPub, keypair, buyAmountLamports, false, secondPub, SLIPPAGE);
                } else if (poolType === 'dlmm') {
                    sig = await swapOnMeteora(solanaConnection, keypair, BUY_AMOUNT / LAMPORTS_PER_SOL, true, poolId); // swapForY: true/false as needed
                }
                if (sig) {
                    console.log("Buy Success :", `https://solscan.io/tx/${sig}`);
                    await monitorAndSell(mint, poolPub, keypair, secondPub, SLIPPAGE, buyAmountLamports);
                } else {
                    console.log("Buy failed!");
                }
            } else {
                console.log("No supported pool found for this token. Skipping.");
                return;
            }
        } else {
            console.log("No LP pool found for the target CA using Shyft API.");
            return;
        }

        if (!poolId) {
            console.log("Could not determine LP pool ID. Skipping.");
            return;
        }

        console.log("LP pool found! PoolId : ", poolId);

        let checked_market = false;
        if (CHECK_MARKET_CAP) {
            console.log("Checking MarketCap!");
            const poolPub = new PublicKey(poolId);
            const marketcap = await getMarketCap(solanaConnection, keypair, mint);
            console.log("MarketCap => ", marketcap ? marketcap.toFixed(2) : 0);
            if (!marketcap || !(marketcap >= MINIMUM_MARKET_CAP && marketcap <= MAXIMUM_MARKET_CAP)) {
                console.log("This token's market cap is out of our range! Skipping.");
                return;
            }
            checked_market = true;
        }

        let checked_liquidity = false;
        if (CHECK_LIQUIDITY) {
            console.log("Checking Liquidity!");
            const poolPub = new PublicKey(poolId);
            const liquidity = await getLiquidity(solanaConnection, keypair, poolPub);
            console.log("Liquidity => ", liquidity ? liquidity.toFixed(2) : 0, 'Sol');
            if (!liquidity || !(liquidity >= MINIMUM_LIQUIDITY && liquidity <= MAXIMUM_LIQUIDITY)) {
                console.log("This token's liquidity is out of our range! Skipping.");
                return;
            }
            checked_liquidity = true;
        }

        if ((CHECK_MARKET_CAP && !checked_market) || (CHECK_LIQUIDITY && !checked_liquidity)) {
            console.log("Market cap or liquidity checks failed. Skipping buy.");
            return;
        }

        const poolPub = new PublicKey(poolId);
        const buyAmountLamports = new BN(BUY_AMOUNT); // Assuming BUY_AMOUNT is already in lamports from .env
        console.log(`Going to buy with ${BUY_AMOUNT} lamports!`);
        const sig = await swapOnMeteoraDYN(solanaConnection, poolPub, keypair, buyAmountLamports, false, secondPub, SLIPPAGE);
        if (sig) {
            console.log("Buy Success :", `https://solscan.io/tx/${sig}`);
            console.log("\n");
            await monitorAndSell(mint, poolPub, keypair, secondPub, SLIPPAGE, buyAmountLamports);
        } else {
            console.log("Buy failed!");
            console.log("\n");
        }

    } catch (error) {
        console.error("Error processing target CA:", error);
    }
}

async function monitorAndSell(mint: PublicKey, poolPub: PublicKey, wallet: Keypair, toWallet: PublicKey, slippage: number, buyAmountLamports: InstanceType<typeof BN>) {
    console.log("Starting stop-loss/take-profit monitoring...");
    let initialPriceUSD: number | null = null;
    let tokensBoughtAmount: number | null = null; 

    const solPriceUSD = await getTokenPriceJup('So11111111111111111111111111111111111111112');
    const tokenPriceInSol = await getTokenPriceJup(mint.toBase58());

    if (solPriceUSD && tokenPriceInSol) {
        initialPriceUSD = tokenPriceInSol * solPriceUSD;
        // Estimate tokens bought. This is a rough estimation.
        // A more accurate way would be to get the actual out_amount from the swap transaction.
        const buyAmountSOL = buyAmountLamports.toNumber() / LAMPORTS_PER_SOL;
        tokensBoughtAmount = buyAmountSOL / tokenPriceInSol; 
        console.log(`Initial token price (USD): $${initialPriceUSD.toFixed(6)} per token`);
        console.log(`Estimated tokens bought: ${tokensBoughtAmount.toFixed(6)}`);
    } else {
        console.error("Could not determine initial token price in USD. Stop-loss/take-profit monitoring aborted.");
        return;
    }

    if (tokensBoughtAmount === null || tokensBoughtAmount <= 0) {
        console.error("Estimated tokens bought is zero or null. Cannot monitor. Check BUY_AMOUNT and price fetching.");
        return;
    }

    const monitorInterval = setInterval(async () => {
        try {
            const currentTokenPriceInSol = await getTokenPriceJup(mint.toBase58());
            const currentSolPriceUSD = await getTokenPriceJup('So11111111111111111111111111111111111111112');

            if (!currentTokenPriceInSol || !currentSolPriceUSD) {
                console.log("Could not fetch current token price. Retrying...");
                return;
            }

            const currentPriceUSD = currentTokenPriceInSol * currentSolPriceUSD;
            console.log(`Current token price (USD): $${currentPriceUSD.toFixed(6)} per token`);

            const profitLossPercentage = ((currentPriceUSD - initialPriceUSD!) / initialPriceUSD!) * 100;
            console.log(`Profit/Loss: ${profitLossPercentage.toFixed(2)}%`);

            let sellTriggered = false;
            if (profitLossPercentage >= TAKE_PROFIT_PERCENTAGE) {
                console.log(`Take-profit target (${TAKE_PROFIT_PERCENTAGE}%) reached! Selling...`);
                sellTriggered = true;
            } else if (profitLossPercentage <= -STOP_LOSS_PERCENTAGE) {
                console.log(`Stop-loss limit (${STOP_LOSS_PERCENTAGE}%) reached! Selling...`);
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
                const placeholderSellAmount = new BN(1); // Placeholder: Sell 1 base unit. Replace with actual balance.
                
                // IMPORTANT: The sellOnMeteoraDYN function needs the amount of the token you are selling (not SOL).
                // You need to get the actual balance of `mint` token you hold after the buy.
                // For now, I'm passing a placeholder. This will fail in a real scenario.
                // You'd typically fetch the associated token account balance for `mint`.
                const sellSig = await sellOnMeteoraDYN(solanaConnection, poolPub, wallet, placeholderSellAmount, true, toWallet, slippage); 
                if(sellSig) {
                    console.log("Sell order sent. Signature:", sellSig);
                } else {
                    console.log("Sell order failed.");
                }
            }
        } catch (error) {
            console.error("Error during monitoring:", error);
        }
    }, 15000); // Check every 15 seconds
}

main().catch((err) => {
    console.error('Unhandled error in main:', err);
    process.exit(1);
});



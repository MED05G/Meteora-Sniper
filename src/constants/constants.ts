import { Connection } from "@solana/web3.js";
import { logger } from "../utils/logger";
import { retrieveEnvVariable } from "../utils/utils";

export const PRIVATE_KEY = retrieveEnvVariable("PRIVATE_KEY", logger)
export const SECOND_WALLET = retrieveEnvVariable("SECOND_WALLET", logger)
export const RPC_ENDPOINT = retrieveEnvVariable("RPC_ENDPOINT", logger)
export const RPC_WEBSOCKET_ENDPOINT = retrieveEnvVariable("RPC_WEBSOCKET_ENDPOINT", logger)

// GRPC_ENDPOINT and GRPC_TOKEN are now optional as they are not needed for specific CA buying logic
export const GRPC_ENDPOINT = process.env.GRPC_ENDPOINT || "";
export const GRPC_TOKEN = process.env.GRPC_TOKEN || "";

export const TARGET_CA = retrieveEnvVariable("TARGET_CA", logger); // New: Specific contract address to buy
export const BUY_AMOUNT = Number(retrieveEnvVariable("BUY_AMOUNT", logger));

// Simplified checks based on user requirements
export const CHECK_MARKET_CAP = retrieveEnvVariable("CHECK_MARKET_CAP", logger) === "true"
export const MINIMUM_MARKET_CAP = Number(retrieveEnvVariable("MINIMUM_MARKET_CAP", logger))
export const MAXIMUM_MARKET_CAP = Number(retrieveEnvVariable("MAXIMUM_MARKET_CAP", logger))

export const CHECK_LIQUIDITY = retrieveEnvVariable("CHECK_LIQUIDITY", logger) === "true"
export const MINIMUM_LIQUIDITY = Number(retrieveEnvVariable("MINIMUM_LIQUIDITY", logger))
export const MAXIMUM_LIQUIDITY = Number(retrieveEnvVariable("MAXIMUM_LIQUIDITY", logger))

// Fee configs
export const JITO_MODE = retrieveEnvVariable("JITO_MODE", logger) === "true"
export const JITO_FEE = Number(retrieveEnvVariable("JITO_FEE", logger))

export const NEXTBLOCK_MODE = retrieveEnvVariable("NEXTBLOCK_MODE", logger) === "true"
export const NEXT_BLOCK_API = retrieveEnvVariable("NEXT_BLOCK_API", logger)
export const NEXT_BLOCK_FEE = Number(retrieveEnvVariable("NEXT_BLOCK_FEE", logger))

export const BLOXROUTE_MODE = retrieveEnvVariable("BLOXROUTE_MODE", logger) === "true"
export const BLOXROUTE_FEE = Number(retrieveEnvVariable("BLOXROUTE_FEE", logger))
export const BLOXROUTE_AUTH_HEADER = retrieveEnvVariable("BLOXROUTE_AUTH_HEADER", logger)

export const SLIPPAGE = Number(retrieveEnvVariable("SLIPPAGE", logger))
export const PRIORITY_FEE =  Number(retrieveEnvVariable("PRIORITY_FEE", logger))

export const PROGRAM_ID = "Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB";
export const wsol = "So11111111111111111111111111111111111111112";
export const usdc = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
export const usdt =  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"; // USDT

export const solanaConnection = new Connection(RPC_ENDPOINT)

export const STOP_LOSS_PERCENTAGE = Number(retrieveEnvVariable("STOP_LOSS_PERCENTAGE", logger));
export const TAKE_PROFIT_PERCENTAGE = Number(retrieveEnvVariable("TAKE_PROFIT_PERCENTAGE", logger));


export const SHYFT_API_KEY = retrieveEnvVariable("SHYFT_API_KEY", logger);



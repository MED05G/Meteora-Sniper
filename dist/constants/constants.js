"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TAKE_PROFIT_PERCENTAGE = exports.STOP_LOSS_PERCENTAGE = exports.solanaConnection = exports.usdt = exports.usdc = exports.wsol = exports.PROGRAM_ID = exports.PRIORITY_FEE = exports.SLIPPAGE = exports.BLOXROUTE_AUTH_HEADER = exports.BLOXROUTE_FEE = exports.BLOXROUTE_MODE = exports.NEXT_BLOCK_FEE = exports.NEXT_BLOCK_API = exports.NEXTBLOCK_MODE = exports.JITO_FEE = exports.JITO_MODE = exports.MAXIMUM_LIQUIDITY = exports.MINIMUM_LIQUIDITY = exports.CHECK_LIQUIDITY = exports.MAXIMUM_MARKET_CAP = exports.MINIMUM_MARKET_CAP = exports.CHECK_MARKET_CAP = exports.BUY_AMOUNT = exports.TARGET_CA = exports.GRPC_TOKEN = exports.GRPC_ENDPOINT = exports.RPC_WEBSOCKET_ENDPOINT = exports.RPC_ENDPOINT = exports.SECOND_WALLET = exports.PRIVATE_KEY = void 0;
const web3_js_1 = require("@solana/web3.js");
const logger_1 = require("../utils/logger");
const utils_1 = require("../utils/utils");
exports.PRIVATE_KEY = (0, utils_1.retrieveEnvVariable)("PRIVATE_KEY", logger_1.logger);
exports.SECOND_WALLET = (0, utils_1.retrieveEnvVariable)("SECOND_WALLET", logger_1.logger);
exports.RPC_ENDPOINT = (0, utils_1.retrieveEnvVariable)("RPC_ENDPOINT", logger_1.logger);
exports.RPC_WEBSOCKET_ENDPOINT = (0, utils_1.retrieveEnvVariable)("RPC_WEBSOCKET_ENDPOINT", logger_1.logger);
// GRPC_ENDPOINT and GRPC_TOKEN are now optional as they are not needed for specific CA buying logic
exports.GRPC_ENDPOINT = process.env.GRPC_ENDPOINT || "";
exports.GRPC_TOKEN = process.env.GRPC_TOKEN || "";
exports.TARGET_CA = (0, utils_1.retrieveEnvVariable)("TARGET_CA", logger_1.logger); // New: Specific contract address to buy
exports.BUY_AMOUNT = Number((0, utils_1.retrieveEnvVariable)("BUY_AMOUNT", logger_1.logger));
// Simplified checks based on user requirements
exports.CHECK_MARKET_CAP = (0, utils_1.retrieveEnvVariable)("CHECK_MARKET_CAP", logger_1.logger) === "true";
exports.MINIMUM_MARKET_CAP = Number((0, utils_1.retrieveEnvVariable)("MINIMUM_MARKET_CAP", logger_1.logger));
exports.MAXIMUM_MARKET_CAP = Number((0, utils_1.retrieveEnvVariable)("MAXIMUM_MARKET_CAP", logger_1.logger));
exports.CHECK_LIQUIDITY = (0, utils_1.retrieveEnvVariable)("CHECK_LIQUIDITY", logger_1.logger) === "true";
exports.MINIMUM_LIQUIDITY = Number((0, utils_1.retrieveEnvVariable)("MINIMUM_LIQUIDITY", logger_1.logger));
exports.MAXIMUM_LIQUIDITY = Number((0, utils_1.retrieveEnvVariable)("MAXIMUM_LIQUIDITY", logger_1.logger));
// Fee configs
exports.JITO_MODE = (0, utils_1.retrieveEnvVariable)("JITO_MODE", logger_1.logger) === "true";
exports.JITO_FEE = Number((0, utils_1.retrieveEnvVariable)("JITO_FEE", logger_1.logger));
exports.NEXTBLOCK_MODE = (0, utils_1.retrieveEnvVariable)("NEXTBLOCK_MODE", logger_1.logger) === "true";
exports.NEXT_BLOCK_API = (0, utils_1.retrieveEnvVariable)("NEXT_BLOCK_API", logger_1.logger);
exports.NEXT_BLOCK_FEE = Number((0, utils_1.retrieveEnvVariable)("NEXT_BLOCK_FEE", logger_1.logger));
exports.BLOXROUTE_MODE = (0, utils_1.retrieveEnvVariable)("BLOXROUTE_MODE", logger_1.logger) === "true";
exports.BLOXROUTE_FEE = Number((0, utils_1.retrieveEnvVariable)("BLOXROUTE_FEE", logger_1.logger));
exports.BLOXROUTE_AUTH_HEADER = (0, utils_1.retrieveEnvVariable)("BLOXROUTE_AUTH_HEADER", logger_1.logger);
exports.SLIPPAGE = Number((0, utils_1.retrieveEnvVariable)("SLIPPAGE", logger_1.logger));
exports.PRIORITY_FEE = Number((0, utils_1.retrieveEnvVariable)("PRIORITY_FEE", logger_1.logger));
exports.PROGRAM_ID = "Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB";
exports.wsol = "So11111111111111111111111111111111111111112";
exports.usdc = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
exports.usdt = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"; // USDT
exports.solanaConnection = new web3_js_1.Connection(exports.RPC_ENDPOINT);
exports.STOP_LOSS_PERCENTAGE = Number((0, utils_1.retrieveEnvVariable)("STOP_LOSS_PERCENTAGE", logger_1.logger));
exports.TAKE_PROFIT_PERCENTAGE = Number((0, utils_1.retrieveEnvVariable)("TAKE_PROFIT_PERCENTAGE", logger_1.logger));

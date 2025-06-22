"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPoolsByToken = getPoolsByToken;
const axios_1 = __importDefault(require("axios"));
const constants_1 = require("../constants");
async function getPoolsByToken(tokenAddress) {
    try {
        if (!constants_1.SHYFT_API_KEY) {
            console.error("SHYFT_API_KEY is not set in the environment variables.");
            return null;
        }
        const response = await axios_1.default.get(`https://defi.shyft.to/v0/pools/get_by_token?token=${tokenAddress}`, {
            headers: {
                'x-api-key': constants_1.SHYFT_API_KEY,
            },
        });
        if (response.data.success) {
            const allPools = [];
            for (const dexKey in response.data.result.dexes) {
                const dex = response.data.result.dexes[dexKey];
                if (dex && dex.pools) {
                    allPools.push(...dex.pools);
                }
            }
            return allPools;
        }
        else {
            console.error("Shyft API error:", response.data.message);
            return null;
        }
    }
    catch (error) {
        console.error("Error fetching pools from Shyft API:", error);
        return null;
    }
}

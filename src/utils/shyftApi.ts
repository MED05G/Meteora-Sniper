
import axios from 'axios';
import { SHYFT_API_KEY } from '../constants';

interface PoolInfo {
    lpMint: string;
    tokenAMint: string;
    tokenBMint: string;
    tokenXMint?: string;
    tokenYMint?: string;
    pubkey?: string; 

    // Add other relevant fields from the Shyft API response if needed
}

interface ShyftApiResponse {
    success: boolean;
    message: string;
    result: {
        dexes: {
            meteoraAmm?: { pools: PoolInfo[] };
            raydiumAmm?: { pools: PoolInfo[] };
            orca?: { pools: PoolInfo[] };
            meteoraDlmm?: { pools: PoolInfo[] };
            // Add other DEXs as needed
        };
    };
}

export async function getPoolsByToken(tokenAddress: string): Promise<PoolInfo[] | null> {
    try {
        if (!SHYFT_API_KEY) {
            console.error("SHYFT_API_KEY is not set in the environment variables.");
            return null;
        }

        const response = await axios.get<ShyftApiResponse>(
            `https://defi.shyft.to/v0/pools/get_by_token?token=${tokenAddress}`,
            {
                headers: {
                    'x-api-key': SHYFT_API_KEY,
                },
            }
        );

        if (response.data.success) {
            const allPools: PoolInfo[] = [];
            for (const dexKey in response.data.result.dexes) {
                const dex = response.data.result.dexes[dexKey as keyof typeof response.data.result.dexes];
                if (dex && dex.pools) {
                    allPools.push(...dex.pools);
                }
            }
            return allPools;
        } else {
            console.error("Shyft API error:", response.data.message);
            return null;
        }
    } catch (error) {
        console.error("Error fetching pools from Shyft API:", error);
        return null;
    }
}



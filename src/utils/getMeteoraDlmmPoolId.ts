import { PublicKey } from '@solana/web3.js';
import fetch from 'node-fetch'; // Or your preferred HTTP client like axios

// It's highly recommended to store your API key in an environment variable
const SHYFT_API_KEY = process.env.SHYFT_API_KEY; 

interface PoolData {
  baseKey: string;
  activeId: string;
  tokenXMint: string;
  tokenYMint: string;
  status: number;
}

interface ShyftGraphQLResponse {
  data?: {
    meteora_dlmm_LbPair: PoolData[];
  };
  errors?: any[]; // You might want to define a more specific interface for errors
}

export const getMeteoraDlmmPoolId = async (tokenAddressX: PublicKey, tokenAddressY: PublicKey): Promise<PublicKey | null> => {
  if (!SHYFT_API_KEY) {
    console.error("SHYFT_API_KEY is not set in environment variables.");
    return null;
  }

  try {
    const operationsDoc = `
      query GetPoolByTokens {
        meteora_dlmm_LbPair(
          where: {
            _or: [
              {
                tokenXMint: {_eq: "${tokenAddressX.toBase58()}"},
                tokenYMint: {_eq: "${tokenAddressY.toBase58()}"}
              },
              {
                tokenXMint: {_eq: "${tokenAddressY.toBase58()}"},
                tokenYMint: {_eq: "${tokenAddressX.toBase58()}"}
              }
            ],
            status: {_eq: 1} // Typically, status 1 means active
          },
          limit: 1 // Assuming you want the most relevant or first active pool
        ) {
          baseKey # This is usually the pool address (LbPair address)
          activeId # Can also be the pool address
          tokenXMint
          tokenYMint
          status
        }
      }
    `;

    console.log("Shyft GraphQL Query:", operationsDoc); // Log the query

    const result = await fetch(
      `https://programs.shyft.to/v0/graphql/accounts?api_key=${SHYFT_API_KEY}&network=mainnet-beta`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: operationsDoc, variables: {}, operationName: "GetPoolByTokens" }),
      }
    );

    console.log("Shyft API Fetch Result Status:", result.status, result.statusText); // Log fetch result status

    const responseJson = await result.json() as ShyftGraphQLResponse;
    console.log("Shyft API Raw Response:", JSON.stringify(responseJson, null, 2)); // Log raw JSON response

    if (responseJson.errors) {
      console.error("Shyft GraphQL Errors:", responseJson.errors);
      return null;
    }

    const pools = responseJson.data?.meteora_dlmm_LbPair;
    console.log("Extracted Pools:", pools); // Log the extracted pools array

    if (pools && pools.length > 0) {
      const poolInfo = pools[0];
      console.log(`Found pool via Shyft: ${poolInfo.baseKey || poolInfo.activeId} for tokens ${poolInfo.tokenXMint} and ${poolInfo.tokenYMint}`);
      // The pool ID is typically 'baseKey' or 'activeId'. Prefer baseKey if available.
      const poolAddress = poolInfo.baseKey || poolInfo.activeId;
      if (poolAddress) {
        return new PublicKey(poolAddress);
      }
      console.log("No valid pool address (baseKey or activeId) found in the pool info.");
      return null;
    } else {
      console.log(`No active DLMM pool found on Shyft for the token pair: ${tokenAddressX.toBase58()} and ${tokenAddressY.toBase58()}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching DLMM pool ID from Shyft:", error);
    return null;
  }
};


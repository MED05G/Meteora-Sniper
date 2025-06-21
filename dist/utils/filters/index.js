"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkTicker = exports.checkBurn = exports.checkMutable = void 0;
exports.checkMintable = checkMintable;
exports.checkFreezeAuthority = checkFreezeAuthority;
exports.getFreezeAuthority = getFreezeAuthority;
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const raydium_sdk_1 = require("@raydium-io/raydium-sdk");
const mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
const constants_1 = require("../../constants/constants");
async function checkMintable(vault) {
    try {
        let { data } = (await constants_1.solanaConnection.getAccountInfo(vault)) || {};
        if (!data) {
            return;
        }
        const deserialize = spl_token_1.MintLayout.decode(data);
        return deserialize.mintAuthorityOption === 0;
    }
    catch (e) {
        console.log(`Failed to check if mint is renounced`, vault);
    }
}
const checkMutable = async (baseMint) => {
    try {
        const metadataPDA = (0, raydium_sdk_1.getPdaMetadataKey)(baseMint);
        const metadataAccount = await constants_1.solanaConnection.getAccountInfo(metadataPDA.publicKey);
        if (!metadataAccount?.data) {
            return { ok: false, message: 'Mutable -> Failed to fetch account data' };
        }
        const serializer = (0, mpl_token_metadata_1.getMetadataAccountDataSerializer)();
        const deserialize = serializer.deserialize(metadataAccount.data);
        const mutable = deserialize[0].isMutable;
        return !mutable;
    }
    catch (e) {
        return false;
    }
};
exports.checkMutable = checkMutable;
const checkBurn = async (lpMint) => {
    try {
        const amount = await constants_1.solanaConnection.getTokenSupply(lpMint, 'confirmed');
        const burned = amount.value.uiAmount === 0;
        return burned;
    }
    catch (error) {
        return false;
    }
};
exports.checkBurn = checkBurn;
async function checkFreezeAuthority(mintPublicKey) {
    // Fetch the mint account info
    const mintAccountInfo = await constants_1.solanaConnection.getAccountInfo(mintPublicKey);
    if (!mintAccountInfo) {
        throw new Error('Mint account not found');
    }
    // Parse the mint account data
    const mintData = parseMintAccountData(mintAccountInfo.data);
    console.log("🚀 ~ checkFreezeAuthority ~ mintData:", mintData);
    // Check if the freeze authority is set
    if (mintData.freezeAuthority) {
        console.log(`Freeze Authority: ${mintData.freezeAuthority.toBase58()}`);
        return true;
    }
    else {
        return false;
    }
}
async function getFreezeAuthority(mint) {
    const mintAccountInfo = await constants_1.solanaConnection.getAccountInfo(mint);
    if (!mintAccountInfo)
        return false;
    const mintData = spl_token_1.MintLayout.decode(mintAccountInfo.data);
    return mintData.freezeAuthorityOption === 1;
}
const checkTicker = async (connection, baseMint, keyword) => {
    try {
        const serializer = (0, mpl_token_metadata_1.getMetadataAccountDataSerializer)();
        const metadataPDA = (0, raydium_sdk_1.getPdaMetadataKey)(baseMint);
        const metadataAccount = await connection.getAccountInfo(metadataPDA.publicKey, 'confirmed');
        if (!metadataAccount?.data) {
            return { ok: false, message: 'Mutable -> Failed to fetch account data' };
        }
        const deserialize = serializer.deserialize(metadataAccount.data);
        const response = await fetch(deserialize[0].uri);
        const data = await response.json();
        console.log("Token Symbol : ", `$${data.symbol}`);
        console.log("Token Name : ", `$${data.name}`);
        if (data.symbol.toUpperCase().indexOf(keyword.toUpperCase()) > -1 || data.name.toUpperCase().indexOf(keyword.toUpperCase()) > -1) {
            return true;
        }
        else {
            return false;
        }
    }
    catch (error) {
        return false;
    }
};
exports.checkTicker = checkTicker;
// Helper function to parse mint account data
function parseMintAccountData(data) {
    // Mint account layout (simplified for this example)
    const mintLayout = {
        mintAuthorityOption: 0,
        mintAuthority: 1,
        supply: 9,
        decimals: 17,
        isInitialized: 18,
        freezeAuthorityOption: 19,
        freezeAuthority: 20,
    };
    const mintAuthorityOption = data.readUInt32LE(mintLayout.mintAuthorityOption);
    const freezeAuthorityOption = data.readUInt32LE(mintLayout.freezeAuthorityOption);
    return {
        mintAuthority: mintAuthorityOption ? new web3_js_1.PublicKey(data.slice(mintLayout.mintAuthority, mintLayout.mintAuthority + 32)) : null,
        supply: data.readBigUInt64LE(mintLayout.supply),
        decimals: data[mintLayout.decimals],
        isInitialized: !!data[mintLayout.isInitialized],
        freezeAuthority: freezeAuthorityOption ? new web3_js_1.PublicKey(data.slice(mintLayout.freezeAuthority, mintLayout.freezeAuthority + 32)) : null,
    };
}

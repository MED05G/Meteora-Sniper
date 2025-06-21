"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchSolPrice = fetchSolPrice;
exports.startSolPricePolling = startSolPricePolling;
exports.getSolPriceFromFile = getSolPriceFromFile;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const jsonFilePath = path_1.default.join(__dirname, 'solPrice.json');
async function fetchSolPrice() {
    try {
        const response = await fetch(`https://api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112`);
        const data = await response.json();
        const solPrice = Number(data.data['So11111111111111111111111111111111111111112'].price);
        // Save the SOL price to a JSON file
        const solPriceData = { solPrice };
        fs_1.default.writeFileSync(jsonFilePath, JSON.stringify(solPriceData));
    }
    catch (error) {
        console.error('Error fetching SOL price:', error);
    }
}
// Function to fetch and save SOL price every 2 seconds
function startSolPricePolling() {
    setInterval(fetchSolPrice, 2000);
}
function getSolPriceFromFile() {
    try {
        const data = fs_1.default.readFileSync(jsonFilePath, 'utf8');
        const { solPrice } = JSON.parse(data);
        return solPrice;
    }
    catch (error) {
        console.error('Error reading SOL price from file:', error);
        return 0;
    }
}

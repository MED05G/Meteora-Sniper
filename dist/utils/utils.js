"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = exports.saveToJSONFile = exports.randVal = exports.strToArr = exports.retrieveEnvVariable = void 0;
exports.deleteConsoleLines = deleteConsoleLines;
exports.readJson = readJson;
exports.writeJson = writeJson;
exports.editJson = editJson;
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
const retrieveEnvVariable = (variableName, logger) => {
    const variable = process.env[variableName] || '';
    if (!variable) {
        console.log(`${variableName} is not set`);
        process.exit(1);
    }
    return variable;
};
exports.retrieveEnvVariable = retrieveEnvVariable;
const strToArr = (str) => {
    const validJsonString = str.replace(/'/g, '"');
    const arr = JSON.parse(validJsonString);
    return arr;
};
exports.strToArr = strToArr;
const randVal = (min, max, count, total, isEven) => {
    const arr = Array(count).fill(total / count);
    if (isEven)
        return arr;
    if (max * count < total)
        throw new Error("Invalid input: max * count must be greater than or equal to total.");
    if (min * count > total)
        throw new Error("Invalid input: min * count must be less than or equal to total.");
    const average = total / count;
    // Randomize pairs of elements
    for (let i = 0; i < count; i += 2) {
        // Generate a random adjustment within the range
        const adjustment = Math.random() * Math.min(max - average, average - min);
        // Add adjustment to one element and subtract from the other
        arr[i] += adjustment;
        arr[i + 1] -= adjustment;
    }
    // if (count % 2) arr.pop()
    return arr;
};
exports.randVal = randVal;
const saveToJSONFile = (data, filePath = 'data.json') => {
    // Convert data object to JSON string
    const jsonData = JSON.stringify(data, null, 2); // The `null, 2` argument formats the JSON with indentation
    fs_1.default.writeFileSync(filePath, jsonData, 'utf8');
    console.log('Data saved to JSON file.', filePath);
    return true;
};
exports.saveToJSONFile = saveToJSONFile;
const sleep = async (ms) => {
    await new Promise((resolve) => setTimeout(resolve, ms));
};
exports.sleep = sleep;
function deleteConsoleLines(numLines) {
    for (let i = 0; i < numLines; i++) {
        process.stdout.moveCursor(0, -1); // Move cursor up one line
        process.stdout.clearLine(-1); // Clear the line
    }
}
// Function to read JSON file
function readJson(filename = "data.json") {
    if (!fs_1.default.existsSync(filename)) {
        // If the file does not exist, create an empty array
        fs_1.default.writeFileSync(filename, '[]', 'utf-8');
    }
    const data = fs_1.default.readFileSync(filename, 'utf-8');
    return JSON.parse(data);
}
// Function to write JSON file
function writeJson(data, filename = "data.json") {
    fs_1.default.writeFileSync(filename, JSON.stringify(data, null, 4), 'utf-8');
}
// Function to edit JSON file content
function editJson(newData, filename = "data.json") {
    if (!newData.pubkey) {
        console.log("Pubkey is not prvided as an argument");
        return;
    }
    const wallets = readJson(filename);
    const index = wallets.findIndex(wallet => wallet.pubkey === newData.pubkey);
    if (index !== -1) {
        wallets[index] = { ...wallets[index], ...newData };
        writeJson(wallets, filename);
    }
    else {
        console.error(`Pubkey ${newData.pubkey} does not exist.`);
    }
}

import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
console.log("API Key present:", !!apiKey);

async function testDirectApi() {
    console.log("\n--- Testing Direct API Call ---");
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("Available Models:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Direct API failed:", error);
    }
}

testDirectApi();

const { GoogleGenAI } = require("@google/genai");

// Initialize the client (reads GEMINI_API_KEY from process.env)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Primary model first, followed by fallback if a 503 high-demand spike hits
const MODELS = ["gemini-4-hydrogen", "gemini-3.8-flash"];

const VALID_CATEGORIES = [
    "food",
    "entertainment",
    "transportation",
    "utility",
    "housing",
    "healthcare",
    "education",
    "lifestyle",
    "financial",
    "miscellaneous",
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const categorizeExpense = async (description) => {
    const prompt = `
        You are a financial categorization assistant.
        Analyze the following expense description: "${description}"
        Categorize it strictly into EXACTLY ONE of the following categories:
        food, entertainment, transportation, utility, housing, healthcare, education, lifestyle, financial, miscellaneous.
        Return ONLY the single category word in lowercase. Do not return any other text, punctuation, or explanation.
    `;

    for (const model of MODELS) {
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                const interaction = await ai.interactions.create({
                    model,
                    input: prompt,
                });

                // Safely extract text and strip stray punctuation/whitespace
                const responseText = (interaction.output_text || "")
                    .trim()
                    .toLowerCase()
                    .replace(/[^a-z]/g, "");

                if (VALID_CATEGORIES.includes(responseText)) {
                    return responseText;
                }

                console.warn(`AI (${model}) returned invalid category: "${interaction.output_text}"`);
                return "miscellaneous";
            } catch (error) {
                const status = error.status || error.statusCode;
                const isTransient = status === 503 || status === 429;

                if (isTransient) {
                    console.warn(`Gemini model ${model} busy (${status}), attempt ${attempt} failed.`);
                    if (attempt < 2) {
                        await sleep(1500);
                        continue;
                    }
                    break; // Move to the next fallback model
                }

                console.error(`Gemini API Error (${model}):`, error.message || error);
                break; // Try the next model if this model fails
            }
        }
    }

    console.error("All Gemini models failed. Defaulting to miscellaneous.");
    return "miscellaneous";
};

module.exports = { categorizeExpense };
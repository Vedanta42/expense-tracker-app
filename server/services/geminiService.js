const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Put the fastest working model from Step 1 first
const MODELS = [
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-3.8-flash",
    "gemini-4-hydrogen",
];

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

const KEYWORD_FALLBACK = {
    food: ["pizza", "dosa", "burger", "lunch", "dinner", "breakfast", "coffee", "tea", "grocery", "groceries", "restaurant", "swiggy", "zomato"],
    entertainment: ["party", "movie", "netflix", "concert", "game", "spotify", "cinema", "club"],
    transportation: ["uber", "ola", "bus", "petrol", "fuel", "diesel", "train", "flight", "taxi", "auto", "metro", "fare"],
    utility: ["electricity", "water", "wifi", "internet", "broadband", "gas", "bill", "recharge", "mobile", "apdcl"],
    housing: ["rent", "maintenance", "furniture", "repair", "plumber", "electrician"],
    healthcare: ["gym", "doctor", "medicine", "pharmacy", "hospital", "clinic", "dental", "health"],
    education: ["course", "book", "books", "tuition", "college", "school", "exam", "udemy", "keyboard"],
    lifestyle: ["tshirt", "jeans", "clothes", "shoes", "salon", "haircut", "shopping", "delivery"],
    financial: ["tax", "insurance", "emi", "loan", "bank", "investment", "sip"],
};

const fallbackCategorize = (description) => {
    const text = description.toLowerCase();
    for (const [category, keywords] of Object.entries(KEYWORD_FALLBACK)) {
        if (keywords.some((word) => text.includes(word))) {
            return category;
        }
    }
    return "miscellaneous";
};

const categorizeExpense = async (description) => {
    const prompt = `Categorize this expense description into EXACTLY ONE category from this list: ${VALID_CATEGORIES.join(", ")}.
Expense: "${description}"
Return ONLY the single lowercase category word with no punctuation or extra text.`;

    for (const model of MODELS) {
        try {
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
            });

            const responseText = (response.text || "")
                .trim()
                .toLowerCase()
                .replace(/[^a-z]/g, "");

            if (VALID_CATEGORIES.includes(responseText)) {
                return responseText;
            }

            console.warn(`AI (${model}) returned invalid category: "${response.text}"`);
        } catch (error) {
            const status = error.status || error.statusCode || "ERR";
            console.warn(`Gemini (${model}) failed [${status}]: ${error.message || error}`);
        }
    }

    const fallback = fallbackCategorize(description);
    console.warn(`All Gemini models unavailable. Using local fallback: ${fallback}`);
    return fallback;
};

module.exports = { categorizeExpense };
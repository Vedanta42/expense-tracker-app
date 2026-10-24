const { GoogleGenAI } = require("@google/genai");

// Initialize the client (it automatically detects GEMINI_API_KEY from process.env)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const categorizeExpense = async (description) => {
    try {
        const prompt = `
            You are a financial categorization assistant. 
            Analyze the following expense description: "${description}"
            Categorize it strictly into EXACTLY ONE of the following categories: 
            food, entertainment, transportation, utility, housing, healthcare, education, lifestyle, financial, miscellaneous.
            Return ONLY the single category word in lowercase. Do not return any other text, punctuation, or explanation.
        `;

        // Using the new syntax from the documentation
        const interaction = await ai.interactions.create({
            model: "gemini-3.8-flash",
            input: prompt,
        });

        // Extracting text using the new output_text property
        const responseText = interaction.output_text.trim().toLowerCase();
        
        const validCategories = ["food", "entertainment", "transportation", "utility", "housing", "healthcare", "education", "lifestyle", "financial", "miscellaneous"];
        
        if (validCategories.includes(responseText)) {
            return responseText;
        } else {
            console.warn(`AI returned invalid category: ${responseText}`);
            return "miscellaneous"; 
        }
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "miscellaneous"; // Fallback on network/API error
    }
};

module.exports = { categorizeExpense };
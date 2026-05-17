const axios = require('axios');

const analyzeProduct = async (productName, searchResults, quickReview) => {
  const reviewText = searchResults.results.length > 0
    ? searchResults.results.map((r) => `[${r.platform}] ${r.title}: ${r.snippet}`).join('\n')
    : "No live internet data found. Please act as an expert and provide a highly detailed review based entirely on your internal training knowledge of this product.";

  const prompt = `You are an expert AI Product Review Analyzer. Analyze "${productName}". 
If COLLECTED REVIEW DATA is a fallback message, use your internal knowledge to fill out all the fields realistically.

=== COLLECTED REVIEW DATA ===
${reviewText}

=== QUICK AI ANALYSIS ===
${quickReview}

Return ONLY this JSON (no extra text):
{
  "product_name": "${productName}",
  "overall_rating": 7,
  "summary": "2-3 sentences summary",
  "pros": ["pro1", "pro2", "pro3", "pro4", "pro5"],
  "cons": ["con1", "con2", "con3"],
  "platform_insights": {
    "amazon": "what amazon customers say",
    "flipkart": "what flipkart customers say",
    "youtube": "what youtube reviewers say",
    "google": "general web opinion"
  },
  "who_should_buy": "ideal buyer description",
  "who_should_avoid": "who should not buy",
  "price_value": "value for money assessment",
  "alternatives": ["alternative1", "alternative2"],
  "final_verdict": "strong final recommendation",
  "confidence_score": 80
}`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 2000 },
      }
    );

    const rawText = response.data.candidates[0].content.parts[0].text;
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.log('JSON Parse failed');
      }
    }
    throw new Error('AI could not format the result properly.');
  } catch (err) {
    console.log('Gemini error:', err.message);
    throw new Error('Gemini analysis failed: ' + err.message);
  }
};

module.exports = { analyzeProduct };
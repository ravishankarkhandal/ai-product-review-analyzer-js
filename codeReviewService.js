const axios = require('axios');

const analyzeCode = async (codeSnippet) => {
  // Code review ke liye Gemini ka naya prompt
  const prompt = `You are an expert Senior Software Engineer. Please review the following code snippet.
  
Identify bugs, suggest performance and readability improvements, and provide a corrected version.

=== CODE ===
${codeSnippet}

Return ONLY this JSON format (no extra text, no markdown blocks):
{
  "score_out_of_10": 8,
  "bugs_found": ["bug 1 description", "bug 2 description"],
  "suggestions": ["improvement 1", "improvement 2"],
  "corrected_code": "write the fully corrected code here"
}`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        // Code tasks ke liye temperature kam (0.2) rakhte hain taki answer strict aur logical aaye
        generationConfig: { temperature: 0.2, maxOutputTokens: 2000 },
      }
    );

    const rawText = response.data.candidates[0].content.parts[0].text;
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        throw new Error('AI ne galat format return kiya. Kripya dobara try karein.');
      }
    }
    return { error: 'Parse error', raw: rawText };
  } catch (err) {
    throw new Error('Gemini code analysis failed: ' + err.message);
  }
};

module.exports = { analyzeCode };
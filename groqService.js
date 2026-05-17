const axios = require('axios');

const quickAnalysis = async (productName, searchResults) => {
  const reviewText = searchResults.results.length > 0
    ? searchResults.results.map((r) => `[${r.platform}] ${r.title}: ${r.snippet}`).join('\n')
    : "No internet data. Use your internal knowledge to give a quick verdict.";

  const prompt = `You are a product review expert. Based on these search snippets about "${productName}", give a quick structured analysis.

Search Data:
${reviewText}

Return JSON only (no extra text):
{
  "pros": ["point1", "point2", "point3"],
  "cons": ["point1", "point2", "point3"],
  "sentiment": "positive OR negative OR mixed",
  "quick_verdict": "one line verdict"
}`;

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 600,
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.choices[0].message.content;
  } catch (err) {
    console.log('Groq error:', err.message);
    return '{"pros":[],"cons":[],"sentiment":"mixed","quick_verdict":"Could not fetch"}';
  }
};

module.exports = { quickAnalysis };
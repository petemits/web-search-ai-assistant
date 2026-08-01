const axios = require('axios');
const config = require('../../config/config');
const Helpers = require('../utils/helpers');

class AIService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || config.openrouter?.apiKey;
    this.baseUrl = process.env.OPENROUTER_BASE_URL || config.openrouter?.baseUrl || 'https://openrouter.ai/api/v1';
    this.model = process.env.OPENROUTER_MODEL || config.openrouter?.model || 'meta-llama/llama-3.1-8b-instruct:free';
  }

  async getAIResponse(prompt, searchResults, context = {}) {
    Helpers.log('Getting AI analysis from OpenRouter...');
    
    try {
      const fullPrompt = this.buildPrompt(prompt, searchResults, context);

      const response = await axios.post(this.baseUrl + '/chat/completions', {
        model: this.model,
        messages: [
          {
            role: "user",
            content: fullPrompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com',
          'X-Title': 'Web Search AI Assistant'
        },
        timeout: 30000
      });

      if (response.data && response.data.choices && response.data.choices[0]) {
        Helpers.log('AI response received successfully from OpenRouter');
        return response.data.choices[0].message.content;
      } else {
        throw new Error('Invalid response format from OpenRouter');
      }
    } catch (error) {
      Helpers.log('OpenRouter API error: ' + error.message, 'error');
      return this.getFallbackResponse(prompt, searchResults, error);
    }
  }

  buildPrompt(userPrompt, searchResults, context = {}) {
    const timestamp = new Date().toISOString();
    
    return `You are a precise and accurate information assistant. Today is ${timestamp}.

USER QUERY: ${userPrompt}

WEB SEARCH RESULTS:
${searchResults}

INSTRUCTIONS:
1. Analyze the web search results thoroughly
2. Provide a comprehensive, accurate answer based on the available information
3. If the search results are insufficient or unclear, state this explicitly
4. For stock queries: focus on latest prices, trends, and key metrics
5. For product queries: compare deals, prices, and value propositions
6. For general queries: provide well-structured, factual information
7. Always be honest about limitations in the available data
8. Format your response in a clear, readable manner

Please provide your analysis and answer:`;
  }

  getFallbackResponse(prompt, searchResults, error) {
    Helpers.log('Using fallback response due to AI service failure', 'warn');
    
    return `AI Service Temporarily Unavailable

Original Query: ${prompt}

Search Results Summary:
${Helpers.truncateText(searchResults, 1000)}

Due to technical difficulties with the AI service (${error.message}), we're providing the raw search results above. 

For better analysis, please try again in a few moments.

Raw search results have been saved to Google Sheets for your reference.`;
  }
}

module.exports = AIService;
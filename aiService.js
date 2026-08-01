const axios = require('axios');
const config = require('../../config/config');
const Helpers = require('../utils/helpers');

class AIService {
  constructor() {
    this.apiKey = config.ollama.apiKey;
    this.baseUrl = config.ollama.baseUrl;
    this.model = config.ollama.model;
  }

  async getAIResponse(prompt, searchResults, context = {}) {
    Helpers.log('Getting AI analysis...');
    
    try {
      const fullPrompt = this.buildPrompt(prompt, searchResults, context);

      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model: this.model,
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature: 0.3,
          top_p: 0.9,
          top_k: 40
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        timeout: 30000
      });

      if (response.data && response.data.response) {
        Helpers.log('AI response received successfully');
        return response.data.response;
      } else {
        throw new Error('Invalid response format from AI service');
      }
    } catch (error) {
      Helpers.log(`AI service error: ${error.message}`, 'error');
      
      // Fallback response if AI service is unavailable
      return this.getFallbackResponse(prompt, searchResults, error);
    }
  }

  buildPrompt(userPrompt, searchResults, context = {}) {
    const timestamp = new Date().toISOString();
    
    return `You are a precise and accurate information assistant. Today is ${timestamp}.

USER QUERY: ${userPrompt}

WEB SEARCH RESULTS:
${searchResults}

ADDITIONAL CONTEXT: ${JSON.stringify(context, null, 2)}

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

  async validateModel() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`, {
        headers: {
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        timeout: 10000
      });

      const models = response.data.models || [];
      const hasModel = models.some(model => 
        model.name.includes(this.model)
      );

      if (!hasModel) {
        Helpers.log(`Warning: Model '${this.model}' may not be available. Available models: ${models.map(m => m.name).join(', ')}`, 'warn');
      }

      return hasModel;
    } catch (error) {
      Helpers.log(`Model validation failed: ${error.message}`, 'warn');
      return false;
    }
  }
}

module.exports = AIService;
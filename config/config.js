require('dotenv').config();

module.exports = {
  // OpenRouter Configuration
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY,
    baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.2-3b-instruct:free'
  },

  // Application Settings
  app: {
    maxSearchResults: parseInt(process.env.MAX_SEARCH_RESULTS) || 5,
    requestDelayMs: parseInt(process.env.REQUEST_DELAY_MS) || 2000
  }
};
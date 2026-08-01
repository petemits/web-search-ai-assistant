require('dotenv').config();

module.exports = {
  // Ollama Configuration
  ollama: {
    apiKey: process.env.OLLAMA_API_KEY || 'your_ollama_api_key_here',
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'llama2'
  },

  // Google Sheets Configuration
  googleSheets: {
    sheetId: process.env.GOOGLE_SHEET_ID || 'your_google_sheet_id_here',
    credentialsPath: './config/credentials.json'
  },

  // Email Configuration
  email: {
    from: process.env.EMAIL_FROM || 'your-email@gmail.com',
    to: process.env.EMAIL_TO || 'recipient-email@gmail.com'
  },

  // Application Settings
  app: {
    maxSearchResults: parseInt(process.env.MAX_SEARCH_RESULTS) || 5,
    requestDelayMs: parseInt(process.env.REQUEST_DELAY_MS) || 2000,
    logLevel: process.env.LOG_LEVEL || 'info'
  }
};
const config = require('./config/config');
const SearchService = require('./services/searchService');
const AIService = require('./services/aiService');
const SheetService = require('./services/sheetService');
const EmailService = require('./services/emailService');
const Helpers = require('./utils/helpers');

class WebSearchAIAssistant {
  constructor() {
    this.searchService = new SearchService();
    this.aiService = new AIService();
    this.sheetService = new SheetService();
    this.emailService = new EmailService();
  }

  async processPrompt(prompt) {
    Helpers.log('Processing: ' + prompt);
    
    // 1. Search web
    const searchResults = await this.searchService.searchWeb(prompt);
    
    // 2. Get AI analysis
    const aiAnswer = await this.aiService.getAIResponse(prompt, searchResults);
    
    // 3. Save to sheets
    await this.sheetService.saveResult(prompt, aiAnswer);
    
    // 4. Send email
    await this.emailService.sendNotification(prompt, aiAnswer);
    
    return {
      prompt: prompt,
      answer: aiAnswer,
      searchResults: searchResults
    };
  }
}

// Example usage
async function main() {
  const assistant = new WebSearchAIAssistant();
  const result = await assistant.processPrompt("What's the weather today?");
  console.log('Result:', result);
}

if (require.main === module) {
  main();
}

module.exports = WebSearchAIAssistant;
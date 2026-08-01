const config = require('./config/config');
const SearchService = require('./services/searchService');
const AIService = require('./services/aiService');
const FileService = require('./services/fileService');
const Helpers = require('./utils/helpers');

class WebSearchAIAssistant {
  constructor() {
    this.searchService = new SearchService();
    this.aiService = new AIService();
    this.fileService = new FileService();
  }

  async processPrompt(prompt) {
    Helpers.log('Processing: ' + prompt);
    
    try {
      // 1. Search web
      const searchResults = await this.searchService.searchWeb(prompt);
      Helpers.log('Web search completed');
      
      // 2. Get AI analysis
      const aiAnswer = await this.aiService.getAIResponse(prompt, searchResults);
      Helpers.log('AI analysis completed');
      
      // 3. Save to local file
      const saveResult = await this.fileService.saveResult(prompt, aiAnswer, searchResults);
      
      return {
        success: true,
        prompt: prompt,
        answer: aiAnswer,
        searchResults: searchResults,
        savedToFile: saveResult.success,
        filename: saveResult.filename,
        filePath: saveResult.filePath
      };

    } catch (error) {
      console.error('Error:', error.message);
      return {
        success: false,
        error: error.message,
        prompt: prompt
      };
    }
  }

  async processMultiplePrompts(prompts) {
    const results = [];
    
    for (let i = 0; i < prompts.length; i++) {
      const prompt = prompts[i];
      console.log(`\n📝 [${i + 1}/${prompts.length}] Processing: ${prompt}`);
      
      const result = await this.processPrompt(prompt);
      results.push(result);
      
      // Wait between requests
      if (i < prompts.length - 1) {
        await Helpers.delay(config.app.requestDelayMs);
      }
    }

    // Save all results to a single file
    const allResultsFile = await this.fileService.saveAllResults(results);
    if (allResultsFile) {
      console.log(`\n📁 All results also saved to: ${allResultsFile}`);
    }

    return results;
  }
}

// Run the application
async function main() {
  console.log('🚀 Starting Web Search AI Assistant...\n');
  console.log('📁 Results will be saved to the "outputs" folder\n');
  
  const assistant = new WebSearchAIAssistant();
  
  // Test prompts
  const prompts = [
    "What's the current stock price of Tesla?",
    "Best gaming laptops under $1000",
    "Latest AI news 2024",
    "How to learn Python programming"
  ];

  const results = await assistant.processMultiplePrompts(prompts);
  
  console.log('\n📊 RESULTS SUMMARY:');
  console.log('===================');
  
  let successCount = 0;
  results.forEach((result, index) => {
    if (result.success) {
      successCount++;
      console.log(`✅ ${index + 1}. ${result.prompt}`);
      console.log(`   📄 File: ${result.filename}`);
      console.log(`   🤖 Answer: ${result.answer.substring(0, 80)}...`);
    } else {
      console.log(`❌ ${index + 1}. ${result.prompt}`);
      console.log(`   Error: ${result.error}`);
    }
    console.log(''); // Empty line for readability
  });
  
  console.log(`🎉 Completed: ${successCount}/${results.length} successful`);
  console.log(`📂 Check the "outputs" folder for ${results.length} JSON files!`);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Application error:', error);
  });
}

module.exports = WebSearchAIAssistant;
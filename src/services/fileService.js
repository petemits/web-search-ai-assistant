const fs = require('fs');
const path = require('path');
const Helpers = require('../utils/helpers');

class FileService {
  constructor() {
    this.outputDir = path.join(process.cwd(), 'outputs');
    this.ensureOutputDir();
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
      Helpers.log('Created outputs directory');
    }
  }

  async saveResult(prompt, answer, searchResults) {
    try {
      const timestamp = new Date().toISOString();
      const filename = `search-result-${Date.now()}.json`;
      const filePath = path.join(this.outputDir, filename);
      
      const resultData = {
        timestamp: timestamp,
        prompt: prompt,
        answer: answer,
        searchResults: searchResults,
        savedAt: new Date().toLocaleString()
      };

      fs.writeFileSync(filePath, JSON.stringify(resultData, null, 2));
      Helpers.log('Results saved to: ' + filename);
      
      return {
        success: true,
        filePath: filePath,
        filename: filename
      };

    } catch (error) {
      Helpers.log('Error saving to file: ' + error.message, 'error');
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Optional: Save all results to a single file
  async saveAllResults(results) {
    try {
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const filename = `all-results-${timestamp}.json`;
      const filePath = path.join(this.outputDir, filename);
      
      fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
      Helpers.log('All results saved to: ' + filename);
      
      return filePath;
    } catch (error) {
      Helpers.log('Error saving all results: ' + error.message, 'error');
      return null;
    }
  }
}

module.exports = FileService;
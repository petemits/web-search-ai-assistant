class Helpers {
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static truncateText(text, maxLength = 500) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  static sanitizeForSheet(text) {
    if (typeof text !== 'string') return text;
    // Remove or escape characters that might break CSV/Sheet formatting
    return text.replace(/[\r\n\t]/g, ' ').replace(/"/g, '""').trim();
  }

  static formatTimestamp() {
    return new Date().toISOString();
  }

  static validatePrompt(prompt) {
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Prompt must be a non-empty string');
    }
    
    if (prompt.length > 1000) {
      throw new Error('Prompt must be less than 1000 characters');
    }

    return prompt.trim();
  }

  static log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    console.log(logMessage);
  }

  static errorHandler(error, context = '') {
    const errorMessage = `Error in ${context}: ${error.message}`;
    this.log(errorMessage, 'error');
    
    return {
      success: false,
      error: error.message,
      context: context
    };
  }
}

module.exports = Helpers;
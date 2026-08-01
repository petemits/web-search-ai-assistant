class Helpers {
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static truncateText(text, maxLength = 500) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  static log(message) {
    const timestamp = new Date().toISOString();
    console.log('[' + timestamp + '] ' + message);
  }
}

module.exports = Helpers;
const axios = require('axios');
const cheerio = require('cheerio');
const Helpers = require('../utils/helpers');

class SearchService {
  async searchWeb(query) {
    try {
      const searchUrl = 'https://api.duckduckgo.com/?q=' + encodeURIComponent(query) + '&format=json&no_html=1';
      const response = await axios.get(searchUrl);
      const data = response.data;
      
      let results = '';
      if (data.AbstractText) {
        results = data.AbstractText;
      }
      return results || 'No results found.';
    } catch (error) {
      return 'Search error: ' + error.message;
    }
  }
}

module.exports = SearchService;
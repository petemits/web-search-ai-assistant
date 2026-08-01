const axios = require('axios');
const cheerio = require('cheerio');
const Helpers = require('../utils/helpers');

class SearchService {
  constructor() {
    this.searchEngines = ['duckduckgo', 'alternative'];
  }

  async searchWeb(query, maxResults = 5) {
    Helpers.log(`Searching web for: "${query}"`);
    
    try {
      // Try primary search first
      let results = await this.duckDuckGoSearch(query, maxResults);
      
      // If no results, try alternative method
      if (!results || results.trim().length < 50) {
        Helpers.log('Primary search returned limited results, trying alternative...');
        results = await this.alternativeSearch(query, maxResults);
      }

      return results || 'No relevant information found in search results.';
    } catch (error) {
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  async duckDuckGoSearch(query, maxResults) {
    try {
      const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
      
      const response = await axios.get(searchUrl, {
        timeout: 10000
      });
      
      const data = response.data;
      let searchResults = '';

      // Extract abstract if available
      if (data.Abstract && data.AbstractText) {
        searchResults += `Summary: ${data.AbstractText}\n\n`;
      }

      // Extract related topics
      if (data.RelatedTopics && data.RelatedTopics.length > 0) {
        searchResults += 'Related Information:\n';
        data.RelatedTopics.slice(0, maxResults).forEach((topic, index) => {
          if (topic.Text) {
            searchResults += `${index + 1}. ${topic.Text}\n`;
          }
        });
        searchResults += '\n';
      }

      // Extract results from DuckDuckGo
      if (data.Results && data.Results.length > 0) {
        searchResults += 'Additional Sources:\n';
        data.Results.slice(0, maxResults).forEach((result, index) => {
          if (result.FirstURL && result.Text) {
            searchResults += `${index + 1}. ${result.Text} (${result.FirstURL})\n`;
          }
        });
      }

      return searchResults.trim();
    } catch (error) {
      Helpers.log(`DuckDuckGo search failed: ${error.message}`, 'warn');
      return null;
    }
  }

  async alternativeSearch(query, maxResults) {
    try {
      // Using DuckDuckGo HTML version as fallback
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 15000
      });

      const $ = cheerio.load(response.data);
      let results = 'Web Search Results:\n\n';

      $('.result__snippet').slice(0, maxResults).each((index, element) => {
        const snippet = $(element).text().trim();
        if (snippet) {
          results += `${index + 1}. ${snippet}\n\n`;
        }
      });

      return results.trim() || 'No specific information found in search results.';
    } catch (error) {
      Helpers.log(`Alternative search failed: ${error.message}`, 'warn');
      return 'Unable to fetch search results at this time. Please try again later.';
    }
  }

  async enhancedSearch(query) {
    Helpers.log(`Performing enhanced search for: "${query}"`);
    
    // For specific types of queries, we can add specialized search logic
    if (this.isStockQuery(query)) {
      return await this.searchStockInfo(query);
    } else if (this.isProductQuery(query)) {
      return await this.searchProductInfo(query);
    } else {
      return await this.searchWeb(query);
    }
  }

  isStockQuery(query) {
    const stockKeywords = ['stock', 'share price', 'NASDAQ', 'NYSE', 'ticker', 'stock price'];
    return stockKeywords.some(keyword => 
      query.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  isProductQuery(query) {
    const productKeywords = ['deal', 'price', 'buy', 'purchase', 'cost', 'discount', 'sale'];
    return productKeywords.some(keyword => 
      query.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  async searchStockInfo(query) {
    // Specialized stock search logic can be added here
    Helpers.log(`Performing stock-specific search for: "${query}"`);
    return await this.searchWeb(query + ' stock price latest');
  }

  async searchProductInfo(query) {
    // Specialized product search logic can be added here
    Helpers.log(`Performing product-specific search for: "${query}"`);
    return await this.searchWeb(query + ' best deal price comparison');
  }
}

module.exports = SearchService;
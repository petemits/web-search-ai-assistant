const { google } = require('googleapis');
const config = require('../../config/config');
const Helpers = require('../utils/helpers');

class SheetService {
  constructor() {
    this.sheets = null;
    this.sheetId = config.googleSheets.sheetId;
    this.initialized = false;
    this.init();
  }

  async init() {
    try {
      const auth = new google.auth.GoogleAuth({
        keyFile: config.googleSheets.credentialsPath,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.sheets = google.sheets({ version: 'v4', auth });
      this.initialized = true;
      Helpers.log('Google Sheets service initialized successfully');
    } catch (error) {
      Helpers.log(`Google Sheets initialization failed: ${error.message}`, 'error');
      this.initialized = false;
    }
  }

  async ensureInitialized() {
    if (!this.initialized) {
      await this.init();
    }
    
    if (!this.initialized) {
      throw new Error('Google Sheets service not available');
    }
  }

  async saveSearchResult(prompt, answer, searchResults, metadata = {}) {
    await this.ensureInitialized();

    try {
      const timestamp = Helpers.formatTimestamp();
      
      const rowData = [
        timestamp,
        Helpers.sanitizeForSheet(prompt),
        Helpers.sanitizeForSheet(answer),
        Helpers.sanitizeForSheet(searchResults),
        metadata.source || 'web-search',
        metadata.searchType || 'general',
        JSON.stringify(metadata)
      ];

      const request = {
        spreadsheetId: this.sheetId,
        range: 'SearchResults!A:G',
        valueInputOption: 'RAW',
        resource: {
          values: [rowData]
        }
      };

      const response = await this.sheets.spreadsheets.values.append(request);
      
      Helpers.log(`Data saved to Google Sheets. Updated ${response.data.updates.updatedCells} cells`);
      return {
        success: true,
        updatedCells: response.data.updates.updatedCells,
        sheetRange: response.data.updates.updatedRange
      };
    } catch (error) {
      Helpers.log(`Failed to save to Google Sheets: ${error.message}`, 'error');
      throw error;
    }
  }

  async logEmailNotification(prompt, answer, emailTo, emailFrom) {
    await this.ensureInitialized();

    try {
      const timestamp = Helpers.formatTimestamp();
      
      const emailData = [
        timestamp,
        emailFrom,
        emailTo,
        Helpers.sanitizeForSheet(prompt),
        Helpers.sanitizeForSheet(Helpers.truncateText(answer, 300)),
        'pending' // status: pending/sent/failed
      ];

      const request = {
        spreadsheetId: this.sheetId,
        range: 'EmailLog!A:F',
        valueInputOption: 'RAW',
        resource: {
          values: [emailData]
        }
      };

      await this.sheets.spreadsheets.values.append(request);
      Helpers.log('Email notification logged to Google Sheets');
      return true;
    } catch (error) {
      Helpers.log(`Failed to log email notification: ${error.message}`, 'warn');
      return false;
    }
  }

  async initializeSheet() {
    await this.ensureInitialized();

    try {
      // Create headers for SearchResults sheet
      const searchResultsHeaders = [
        ['Timestamp', 'Prompt', 'AI Answer', 'Search Results', 'Source', 'Search Type', 'Metadata']
      ];

      // Create headers for EmailLog sheet
      const emailLogHeaders = [
        ['Timestamp', 'From Email', 'To Email', 'Prompt', 'Answer Preview', 'Status']
      ];

      // Initialize SearchResults sheet
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.sheetId,
        range: 'SearchResults!A1:G1',
        valueInputOption: 'RAW',
        resource: {
          values: searchResultsHeaders
        }
      });

      // Initialize EmailLog sheet
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.sheetId,
        range: 'EmailLog!A1:F1',
        valueInputOption: 'RAW',
        resource: {
          values: emailLogHeaders
        }
      });

      Helpers.log('Google Sheets initialized with required headers');
      return true;
    } catch (error) {
      Helpers.log(`Sheet initialization warning: ${error.message}`, 'warn');
      // Don't throw error - sheets might already be initialized
      return false;
    }
  }

  async getRecentSearches(limit = 10) {
    await this.ensureInitialized();

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range: 'SearchResults!A:G',
      });

      const rows = response.data.values || [];
      // Skip header row and get latest entries
      return rows.slice(1).slice(-limit).reverse();
    } catch (error) {
      Helpers.log(`Failed to fetch recent searches: ${error.message}`, 'warn');
      return [];
    }
  }
}

module.exports = SheetService;
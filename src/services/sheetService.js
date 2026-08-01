const { google } = require('googleapis');
const config = require('../../config/config');
const Helpers = require('../utils/helpers');

class SheetService {
  constructor() {
    this.sheets = null;
    this.init();
  }

  async init() {
    const auth = new google.auth.GoogleAuth({
      keyFile: config.googleSheets.credentialsPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    this.sheets = google.sheets({ version: 'v4', auth });
  }

  async saveResult(prompt, answer) {
    try {
      const request = {
        spreadsheetId: config.googleSheets.sheetId,
        range: 'Sheet1!A:B',
        valueInputOption: 'RAW',
        resource: {
          values: [[new Date().toISOString(), prompt, answer]]
        }
      };
      await this.sheets.spreadsheets.values.append(request);
      return true;
    } catch (error) {
      console.error('Sheet error:', error);
      return false;
    }
  }
}

module.exports = SheetService;
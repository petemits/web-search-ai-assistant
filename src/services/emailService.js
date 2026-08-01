const config = require('../../config/config');
const Helpers = require('../utils/helpers');

class EmailService {
  async sendNotification(prompt, answer) {
    // For now, just log to console
    Helpers.log('Email would be sent to: ' + config.email.to);
    Helpers.log('Subject: AI Result for: ' + prompt.substring(0, 50));
    return true;
  }
}

module.exports = EmailService;
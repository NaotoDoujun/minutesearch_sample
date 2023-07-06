const { recordSettingsViewCallback } = require('./record_settings_view');

module.exports.register = (app) => {
  app.view('settings', recordSettingsViewCallback);
};

const { recordSettingsViewCallback } = require('./record_settings_view');
const { recordUserRateCommentViewCallback } = require('./record_user_rate_comment_view');

module.exports.register = (app) => {
  app.view('settings', recordSettingsViewCallback);
  app.view('user-rate-comment', recordUserRateCommentViewCallback);
};

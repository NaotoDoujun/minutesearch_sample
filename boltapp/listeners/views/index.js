const { recordSettingsViewCallback } = require('./record_settings_view');
const { joinChannelsViewCallback } = require('./join_channels_view');
const { recordUserRateCommentViewCallback } = require('./record_user_rate_comment_view');
const { deleteUserRatingViewCallback } = require('./delete_user_rating_view');

module.exports.register = (app) => {
  app.view('settings', recordSettingsViewCallback);
  app.view('join-channels', joinChannelsViewCallback);
  app.view('user-rate-comment', recordUserRateCommentViewCallback);
  app.view('user-rate-delete', deleteUserRatingViewCallback);
};

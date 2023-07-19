const { openSettingsModalActionCallback } = require('./settings_modal_action');
const { openJoinChannelsModalActionCallback } = require('./join_channels_modal_action');
const { openDeleteConfirmModalActionCallback } = require('./delete_confirm_modal_action');
const { openMoreModalActionCallback } = require('./more_modal_action');
const { pagingPrevActionCallback } = require('./paging_prev_action');
const { pagingNextActionCallback } = require('./paging_next_action');
const { userRateGoodActionCallback } = require('./user_rate_good_action');
const { userRateBadActionCallback } = require('./user_rate_bad_action');

module.exports.register = (app) => {
  app.action('open_settings_modal_button', openSettingsModalActionCallback);
  app.action('join_channels_button', openJoinChannelsModalActionCallback);
  app.action('download_user_ratig_history_button', ({ ack }) => ack());
  app.action('user_ratig_delete_button', openDeleteConfirmModalActionCallback);
  app.action('open_more_modal_button', openMoreModalActionCallback);
  app.action('paging_prev_button', pagingPrevActionCallback);
  app.action('paging_next_button', pagingNextActionCallback);
  app.action('user_rate_good_button', userRateGoodActionCallback);
  app.action('user_rate_bad_button', userRateBadActionCallback);
};

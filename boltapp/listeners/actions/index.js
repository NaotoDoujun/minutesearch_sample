const { openSettingsModalActionCallback } = require('./settings_modal_action');
const { openMoreModalActionCallback } = require('./more_modal_action');
const { pagingPrevActionCallback } = require('./paging_prev_action');
const { pagingNextActionCallback } = require('./paging_next_action');

module.exports.register = (app) => {
  app.action('open_settings_modal_button', openSettingsModalActionCallback);
  app.action('open_more_modal_button', openMoreModalActionCallback);
  app.action('paging_prev_button', pagingPrevActionCallback);
  app.action('paging_next_button', pagingNextActionCallback);
};

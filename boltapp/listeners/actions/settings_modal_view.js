const { Database } = require('../../database');
const { i18n } = require('../../locales');
const { config } = require('../../config');

const settingsModalViews = async (userinfo, logger) => {
  if (userinfo.user.locale === 'ja-JP') {
    i18n.setLocale('ja');
  }
  const title_txt = i18n.__('settings_title');
  const submit_txt = i18n.__('submit');
  const size_label_txt = i18n.__('size_label');
  const min_score_label_txt = i18n.__('min_score_label');
  const userSettings = await Database.getUserSettings(userinfo.user.id, logger);
  const view = {
    type: 'modal',
    callback_id: 'settings',
    title: {
      type: 'plain_text',
      text: title_txt,
    },
    submit: {
      type: 'plain_text',
      text: submit_txt,
    },
    blocks: [
      {
        type: 'input',
        block_id: 'settings_size',
        element: {
          type: 'number_input',
          is_decimal_allowed: false,
          action_id: 'size_input_action',
          initial_value: String(userSettings.size),
          min_value: '1',
          max_value: `${config.DEFAULT_MAX_SIZE}`,
        },
        label: {
          type: 'plain_text',
          text: size_label_txt,
          emoji: true,
        },
      },
      {
        type: 'input',
        block_id: 'settings_min_score',
        element: {
          type: 'number_input',
          is_decimal_allowed: true,
          action_id: 'minscore_input_action',
          initial_value: String(userSettings.min_score),
          min_value: '0',
          max_value: `${config.DEFAULT_MAX_SCORE}`,
        },
        label: {
          type: 'plain_text',
          text: min_score_label_txt,
          emoji: true,
        },
      },
    ],
  };
  return view;
};

module.exports = { settingsModalViews };

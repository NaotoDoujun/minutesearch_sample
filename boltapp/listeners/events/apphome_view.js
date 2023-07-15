const { i18n } = require('../../locales');
const { config } = require('../../config');

const apphomeBlocks = async (userinfo, event) => {
  if (userinfo.user.locale === 'ja-JP') {
    i18n.setLocale('ja');
  }
  const greeting_txt = i18n.__('greeting', { user: event.user });
  const settings_txt = i18n.__('settings_title');
  const settings_description_txt = i18n.__('settings_description');
  const settings_open_button_txt = i18n.__('settings_open_button');
  const download_txt = i18n.__('download_title');
  const download_description_txt = i18n.__('download_description');
  const download_button_txt = i18n.__('download_button');
  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: greeting_txt,
      },
    },
    { type: 'divider' },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: settings_txt,
      },
      fields: [
        {
          type: 'mrkdwn',
          text: settings_description_txt,
        },
      ],
      accessory: {
        type: 'button',
        text: {
          type: 'plain_text',
          text: settings_open_button_txt,
        },
        style: 'primary',
        value: 'clicked',
        action_id: 'open_settings_modal_button',
      },
    },
    { type: 'divider' },
  ];

  if (userinfo.user.is_admin) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: download_txt,
      },
      fields: [
        {
          type: 'mrkdwn',
          text: download_description_txt,
        },
      ],
      accessory: {
        type: 'button',
        text: {
          type: 'plain_text',
          text: download_button_txt,
        },
        style: 'primary',
        value: 'clicked',
        action_id: 'download_user_ratig_history_button',
        url: `http://${config.GLOBAL_APPAPI_HOST}/trouble_user_ratig_history_download/?bot_name=${config.BOT_NAME}&tz_offset=${userinfo.user.tz_offset}`,
      },
    });
  }

  return blocks;
};

module.exports = { apphomeBlocks };

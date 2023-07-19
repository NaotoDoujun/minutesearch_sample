const { i18n } = require('../../locales');
const { config } = require('../../config');

const apphomeBlocks = async (userinfo, event) => {
  if (userinfo.user.locale === 'ja-JP') {
    i18n.setLocale('ja');
  }
  const targetChannelName = userinfo.user.locale === 'ja-JP' ? config.SLACK_CHANNEL_NAME_JP : config.SLACK_CHANNEL_NAME_EN;
  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: i18n.__('greeting', { user: event.user }),
      },
    },
    { type: 'divider' },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: i18n.__('settings_title'),
      },
      fields: [
        {
          type: 'mrkdwn',
          text: i18n.__('settings_description'),
        },
      ],
      accessory: {
        type: 'button',
        text: {
          type: 'plain_text',
          text: i18n.__('settings_open_button'),
        },
        style: 'primary',
        value: 'clicked',
        action_id: 'open_settings_modal_button',
      },
    },
    { type: 'divider' },
  ];

  if (userinfo.user.is_admin) {
    blocks.push(
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: i18n.__('admin_title'),
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: i18n.__('join_channels_title'),
        },
        fields: [
          {
            type: 'mrkdwn',
            text: i18n.__('join_channels_description'),
          },
        ],
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: i18n.__('join_channels_button'),
          },
          style: 'primary',
          value: 'clicked',
          action_id: 'join_channels_button',
        },
      },
      { type: 'divider' },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: i18n.__('download_title'),
        },
        fields: [
          {
            type: 'mrkdwn',
            text: i18n.__('download_description'),
          },
        ],
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: i18n.__('download_button'),
          },
          style: 'primary',
          value: 'clicked',
          action_id: 'download_user_ratig_history_button',
          url: `http://${config.GLOBAL_APPAPI_HOST}/trouble_user_ratig_history_download/?bot_name=${config.BOT_NAME}&tz_offset=${userinfo.user.tz_offset}`,
        },
      },
      { type: 'divider' },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: i18n.__('user_rating_delete_title'),
        },
        fields: [
          {
            type: 'mrkdwn',
            text: i18n.__('user_rating_delete_description', { channel: targetChannelName }),
          },
        ],
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: i18n.__('user_rating_delete_button'),
          },
          style: 'primary',
          value: 'clicked',
          action_id: 'user_ratig_delete_button',
        },
      },
    );
  }

  return blocks;
};

module.exports = { apphomeBlocks };

const { i18n } = require('../../locales');
const { config } = require('../../config');

const deleteConfirmModalViews = async (userinfo) => {
  if (userinfo.user.locale === 'ja-JP') {
    i18n.setLocale('ja');
  }

  const targetChannelName = userinfo.user.locale === 'ja-JP' ? config.SLACK_CHANNEL_NAME_JP : config.SLACK_CHANNEL_NAME_EN;

  const view = {
    type: 'modal',
    external_id: 'delete_confirm_modal',
    callback_id: 'user-rate-delete',
    title: {
      type: 'plain_text',
      text: i18n.__('delete_confirm_modal_title'),
    },
    close: {
      type: 'plain_text',
      text: i18n.__('no'),
    },
    submit: {
      type: 'plain_text',
      text: i18n.__('yes'),
    },
    blocks: [
      {
        type: 'section',
        text: {
          type: 'plain_text',
          text: i18n.__('delete_confirm_description', { channel: targetChannelName }),
          emoji: true,
        },
      },
    ],
  };
  return view;
};

module.exports = { deleteConfirmModalViews };

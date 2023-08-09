const { i18n } = require('../../locales');

const errorModalViews = async (userinfo) => {
  if (userinfo.user.locale === 'ja-JP') {
    i18n.setLocale('ja');
  }
  const title_txt = i18n.__('error_title');
  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: i18n.__('error_title'),
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: i18n.__('error_description'),
      },
    },
  ];
  const view = {
    type: 'modal',
    title: {
      type: 'plain_text',
      text: title_txt,
    },
    blocks,
  };
  return view;
};
    
module.exports = { errorModalViews };

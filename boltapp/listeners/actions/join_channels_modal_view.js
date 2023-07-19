const { i18n } = require('../../locales');

const joinChannelsModalViews = async (userinfo, channellist) => {
  if (userinfo.user.locale === 'ja-JP') {
    i18n.setLocale('ja');
  }
  const initial_options = [];
  const options = [];
  Object.values(channellist.channels).forEach((channel) => {
    const joined_txt = i18n.__('joined', { channel: channel.name });
    const not_joined_txt = i18n.__('not_joined', { channel: channel.name });
    const option_block = {
      text: {
        type: 'plain_text',
        text: channel.is_member ? joined_txt : not_joined_txt,
        emoji: true,
      },
      value: channel.id,
    };
    options.push(option_block);
    if (!channel.is_member) {
      initial_options.push(option_block);
    }
  });

  const blocks = [
    {
      type: 'input',
      block_id: 'join_channels',
      element: {
        type: 'checkboxes',
        action_id: 'join_channels_checkboxes',
        ...initial_options.length > 0 ? { initial_options } : {},
        options,
      },
      label: {
        type: 'plain_text',
        text: i18n.__('join_channels_modal_description'),
        emoji: true,
      },
    },
  ];

  const view = {
    type: 'modal',
    external_id: 'join_channels_modal',
    callback_id: 'join-channels',
    title: {
      type: 'plain_text',
      text: i18n.__('join_channels_modal_title'),
    },
    close: {
      type: 'plain_text',
      text: i18n.__('no'),
    },
    submit: {
      type: 'plain_text',
      text: i18n.__('yes'),
    },
    blocks,
  };
  return view;
};

module.exports = { joinChannelsModalViews };

const { i18n } = require('../../locales');

const moreModalViews = async (userinfo, settings, recommends, from, message) => {
  if (userinfo.user.locale === 'ja-JP') {
    i18n.setLocale('ja');
  }
  const title_txt = i18n.__('more');
  const total = recommends.data.total.value;
  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: i18n.__('user_posted_text_title'),
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `<#${message.channel}>:${message.text}`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: i18n.__('paging_from_to', {
          from: from + 1,
          to: total < from + settings.size ? total : from + settings.size,
        }),
      },
    },
    { type: 'divider' },
  ];

  Object.values(recommends.data.hits).forEach((recommend) => {
    const trouble_header = recommend.trouble_header ? recommend.trouble_header : 'trouble';
    const cause_header = recommend.cause_header ? recommend.cause_header : 'cause';
    const response_header = recommend.response_header ? recommend.response_header : 'response';
    const trouble = recommend.trouble ? recommend.trouble : '';
    const cause = recommend.cause ? recommend.cause : '';
    const response = recommend.response ? recommend.response : '';
    const rated_users = recommend.rated_users ? recommend.rated_users : [];
    const rating = recommend.rating ? recommend.rating : 0;

    const default_rating_info = {
      user: userinfo.user.id,
      user_name: `${userinfo.user.real_name} / ${userinfo.user.name}`,
      positive: false,
      negative: false,
      positive_comment: '',
      negative_comment: '',
    };
    const my_rating_info = (
      rated_users.find(({ user }) => user === userinfo.user.id) ?? default_rating_info);

    blocks.push(
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${trouble_header} score:[${recommend.score}]`,
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: trouble,
        },
      },
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: cause_header,
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: cause,
        },
      },
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: response_header,
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: response,
        },
      },
      {
        type: 'context',
        block_id: `user_rating_score_${recommend.document_id}`,
        elements: [
          {
            type: 'mrkdwn',
            text: i18n.__('user_rating_score', { rating }),
          },
        ],
      },
      {
        type: 'actions',
        block_id: `user_rating_actions_${recommend.document_id}`,
        elements: [
          {
            type: 'button',
            ...my_rating_info.positive ? { style: 'primary' } : {},
            text: {
              type: 'plain_text',
              text: 'Good:thumbsup:',
              emoji: true,
            },
            value: JSON.stringify({
              channel: message.channel,
              client_msg_id: message.client_msg_id,
              document_id: recommend.document_id,
              score: recommend.score,
            }),
            action_id: 'user_rate_good_button',
          },
          {
            type: 'button',
            ...my_rating_info.negative ? { style: 'danger' } : {},
            text: {
              type: 'plain_text',
              text: 'Bad:thumbsdown:',
              emoji: true,
            },
            value: JSON.stringify({
              channel: message.channel,
              client_msg_id: message.client_msg_id,
              document_id: recommend.document_id,
              score: recommend.score,
            }),
            action_id: 'user_rate_bad_button',
          },
        ],
      },
      { type: 'divider' },
    );
  });

  const elements = [];
  if (from > settings.size) {
    elements.push(
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: '← Back',
        },
        value: JSON.stringify({
          channel: message.channel,
          client_msg_id: message.client_msg_id,
          from: from - settings.size,
        }),
        action_id: 'paging_prev_button',
      },
    );
  }

  if (total > (from + settings.size)) {
    elements.push(
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'Next →',
        },
        value: JSON.stringify({
          channel: message.channel,
          client_msg_id: message.client_msg_id,
          from: from + settings.size,
        }),
        action_id: 'paging_next_button',
      },
    );
  }

  // paging
  blocks.push({
    type: 'actions',
    elements,
  });

  // reduce blocks if over 100
  if (blocks.length > 100) {
    const cnt = blocks.length - 100 + 1;
    const idx = blocks.length - 1 - cnt;
    blocks.splice(idx, cnt);
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: i18n.__('blocks_overflow'),
      },
    });
  }

  const view = {
    type: 'modal',
    external_id: 'more_modal',
    title: {
      type: 'plain_text',
      text: title_txt,
    },
    blocks,
  };
  return view;
};

module.exports = { moreModalViews };

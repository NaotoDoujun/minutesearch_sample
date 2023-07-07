const troubleShootBlocks = async (userinfo, settings, message, recommends) => {
  const total = recommends.data.total.value;
  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `<@${userinfo.user.id}>`
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Total Recommends Count:${total}`
      }
    },
    { type: 'divider' }
  ];
  for (const i in recommends.data.hits) {
    const recommend = recommends.data.hits[i];
    const document_id = recommend.document_id;
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
      negative_comment: ''
    };
    const my_rating_info = rated_users.find(({ user }) => user === userinfo.user.id) ?? default_rating_info;

    blocks.push({
      type: 'header',
      text: {
        type: 'plain_text',
        text: `${trouble_header} score:[${recommend.score}]`,
        emoji: true
      }
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
        emoji: true
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: cause,
      }
    },
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: response_header,
        emoji: true
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: response,
      }
    },
    {
      type: 'context',
      block_id: `user_rating_score_${document_id}`,
      elements: [
        {
          type: 'mrkdwn',
          text: `User Rating Score: ${rating}`
        }
      ]
    },
    {
      type: 'actions',
      block_id: `user_rating_actions_${document_id}`,
      elements: [
        {
          type: 'button',
          ...my_rating_info.positive ? { style: 'primary' } : {},
          text: {
            type: 'plain_text',
            text: 'Good:thumbsup:',
            emoji:true,
          } ,
          value: document_id,
          action_id: 'user_rate_good_button'
        },
        {
          type: 'button',
          ...my_rating_info.negative ? { style: 'danger' } : {},
          text: {
            type: 'plain_text',
            text: 'Bad:thumbsdown:',
            emoji:true,
          } ,
          value: document_id,
          action_id: 'user_rate_bad_button'
        }
      ]
    },
    {
      type: 'divider'
    });
  }

  if (total > settings.size) {
    blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'More'
          },
          value: message.text,
          action_id: 'open_more_modal_button'
        }
      ]
    });
  }

  // reduce blocks if over 50
  if (blocks.length > 50) {
    const cnt = blocks.length - 50 + 1;
    const idx = blocks.length - 1 - cnt;
    blocks.splice(idx, cnt);
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: ':warning: Block items overflow...'
      }
    });
  }

  return blocks;
};

module.exports = { troubleShootBlocks };

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
    const trouble_header = recommend.trouble_header ? recommend.trouble_header : 'trouble';
    const cause_header = recommend.cause_header ? recommend.cause_header : 'cause';
    const response_header = recommend.response_header ? recommend.response_header : 'response';
    const trouble = recommend.trouble ? recommend.trouble : '';
    const cause = recommend.cause ? recommend.cause : '';
    const response = recommend.response ? recommend.response : '';
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

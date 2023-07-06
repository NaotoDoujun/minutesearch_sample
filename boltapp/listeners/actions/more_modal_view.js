const moreModalViews = async (userinfo, settings, recommends, from, message) => {
    const title_txt = 'More';
    const total = recommends.data.total.value;
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: 'Posted Text',
          emoji: true
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${message.text}`
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
          }
        );
    }

    const elements = [];
    if (from > 0) {
      elements.push(
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '← Back'
          },
          value: '' + (from - settings.size),
          action_id: 'paging_prev_button'
        }
      );
    }

    if (total > (from + settings.size)) {
      elements.push(
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Next →'
          },
          value: '' + (from + settings.size),
          action_id: 'paging_next_button'
        }
      );
    }

    //paging
    blocks.push({
      type: 'actions',
      elements: elements
    });

    const view = {
        type: 'modal',
        title: {
            type: 'plain_text',
            text: title_txt
        },
        blocks: blocks
    };
    return view;
};

module.exports = { moreModalViews };
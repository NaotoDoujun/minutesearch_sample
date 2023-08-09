const { appApi, slackApi } = require('../../webApi');
const { Database } = require('../../database');
const { i18n } = require('../../locales');
const { userRateCommentModalViews } = require('./user_rate_comment_modal_view');
const { errorModalViews } = require('./error_modal_view');

const updateHistory = async (ratingItem, history, score, logger) => {
  const h_recommend = (
    history.recommends.find(({ document_id }) => document_id === ratingItem.document_id));
  if (h_recommend) {
    const my_rating_info = (
      h_recommend.rated_users.find(({ user }) => user === ratingItem.user_id));
    if (my_rating_info) {
      if (!my_rating_info.positive && !my_rating_info.negative) {
        my_rating_info.negative = true;
        h_recommend.rating -= 1;
      } else if (my_rating_info.positive && !my_rating_info.negative) {
        my_rating_info.positive = false;
        my_rating_info.negative = true;
        h_recommend.rating -= 2;
      } else if (!my_rating_info.positive && my_rating_info.negative) {
        my_rating_info.negative = false;
        h_recommend.rating += 1;
      }
    } else {
      h_recommend.rated_users.push({
        user: ratingItem.user_id,
        user_name: ratingItem.user_name,
        positive: false,
        negative: true,
        positive_comment: '',
        negative_comment: '',
      });
      h_recommend.rating -= 1;
    }
  } else {
    const o_recommend = await appApi.toubleGetSource(ratingItem.document_id);
    o_recommend.data.score = score;
    const my_rating_info = (
      o_recommend.data.rated_users.find(({ user }) => user === ratingItem.user_id));
    if (!my_rating_info) {
      o_recommend.data.rated_users.push({
        user: ratingItem.user_id,
        user_name: ratingItem.user_name,
        positive: false,
        negative: true,
        positive_comment: '',
        negative_comment: '',
      });
    }
    history.recommends.push(o_recommend.data);
  }
  await Database.setHistory(history, logger);
};

const rateBadFromMessage = async (body, client, context, logger) => {
  const userinfo = await slackApi.getUserInfo(client, body.user.id);
  if (userinfo.user.locale === 'ja-JP') {
    i18n.setLocale('ja');
  }
  const params = JSON.parse(body.actions[0].value);
  const history = await Database.getHistory({
    channel: params.channel,
    client_msg_id: params.client_msg_id,
    user: userinfo.user.id,
  }, logger);
  if (history) {
    const ratingItem = {
      document_id: params.document_id,
      user_id: userinfo.user.id,
      user_name: `${userinfo.user.real_name} / ${userinfo.user.name}`,
      rate_type: 'bad',
    };
    // record user rating to elasticsearch as original resource
    const my_rating_info = await appApi.troubleUserRate(ratingItem);
    if (my_rating_info) {
      const score_block_id = `user_rating_score_${ratingItem.document_id}`;
      const actions_block_id = `user_rating_actions_${ratingItem.document_id}`;
      const notify_txt = i18n.__('notify_pressed_bad');
  
      body.message.blocks.forEach((block) => {
        // update score block
        if (block.block_id === score_block_id) {
          if (block.elements && block.elements.length === 1) {
            if ('text' in block.elements[0]) {
              block.elements[0].text = i18n.__('user_rating_score', { rating: my_rating_info.data.rating });
            }
          } else {
            logger.error("score_blocks elements length was not 1. wonder who changed 'user_rating_score_' view? ");
          }
        }
        // update action block
        if (block.block_id === actions_block_id) {
          if (block.elements && block.elements.length === 2) {
            if ('action_id' in block.elements[0] && block.elements[0].action_id === 'user_rate_good_button') {
              // edit style property
              if (my_rating_info.data.positive) {
                block.elements[0].style = 'primary';
              } else if (!my_rating_info.data.positive && 'style' in block.elements[0]) {
                delete block.elements[0].style;
              }
            }
            if ('action_id' in block.elements[1] && block.elements[1].action_id === 'user_rate_bad_button') {
              // edit style property
              if (my_rating_info.data.negative) {
                block.elements[1].style = 'danger';
              } else if (!my_rating_info.data.negative && 'style' in block.elements[1]) {
                delete block.elements[1].style;
              }
            }
          } else {
            logger.error("action_blocks elements length was not 2. wonder who changed 'user_rating_actions_' view? ");
          }
        }
      });
  
      // open comment modal
      if (my_rating_info.data.need_comment) {
        await slackApi.viewsOpen(client, {
          token: context.botToken,
          trigger_id: body.trigger_id,
          view: await userRateCommentModalViews(userinfo, ratingItem, my_rating_info, params),
        });
      }
  
      // redaraw message blocks
      await slackApi.chatUpdate(client, {
        channel: body.container.channel_id,
        ts: body.message.ts,
        text: notify_txt,
        blocks: body.message.blocks,
      });
  
      // record user rating to mongodb as history
      await updateHistory(ratingItem, history, params.score, logger);
    }
  } else {
    await slackApi.viewsOpen(client, {
      token: context.botToken,
      trigger_id: body.trigger_id,
      view: await errorModalViews(userinfo),
    });
  }
};

const rateBadFromView = async (body, client, context, logger) => {
  const userinfo = await slackApi.getUserInfo(client, body.user.id);
  if (userinfo.user.locale === 'ja-JP') {
    i18n.setLocale('ja');
  }
  const params = JSON.parse(body.actions[0].value);
  const history = await Database.getHistory({
    channel: params.channel,
    client_msg_id: params.client_msg_id,
    user: userinfo.user.id,
  }, logger);
  if (history) {
    const ratingItem = {
      document_id: params.document_id,
      user_id: userinfo.user.id,
      user_name: `${userinfo.user.real_name} / ${userinfo.user.name}`,
      rate_type: 'bad',
    };
    // record user rating to elasticsearch as original resource
    const my_rating_info = await appApi.troubleUserRate(ratingItem);
    if (my_rating_info) {
      const score_block_id = `user_rating_score_${ratingItem.document_id}`;
      const actions_block_id = `user_rating_actions_${ratingItem.document_id}`;
  
      body.view.blocks.forEach((block) => {
        // update score block
        if (block.block_id === score_block_id) {
          if (block.elements && block.elements.length === 1) {
            if ('text' in block.elements[0]) {
              block.elements[0].text = i18n.__('user_rating_score', { rating: my_rating_info.data.rating });
            }
          } else {
            logger.error("score_blocks elements length was not 1. wonder who changed 'user_rating_score_' view? ");
          }
        }
        // update action block
        if (block.block_id === actions_block_id) {
          if (block.elements && block.elements.length === 2) {
            if ('action_id' in block.elements[0] && block.elements[0].action_id === 'user_rate_good_button') {
              // edit style property
              if (my_rating_info.data.positive) {
                block.elements[0].style = 'primary';
              } else if (!my_rating_info.data.positive && 'style' in block.elements[0]) {
                delete block.elements[0].style;
              }
            }
            if ('action_id' in block.elements[1] && block.elements[1].action_id === 'user_rate_bad_button') {
              // edit style property
              if (my_rating_info.data.negative) {
                block.elements[1].style = 'danger';
              } else if (!my_rating_info.data.negative && 'style' in block.elements[1]) {
                delete block.elements[1].style;
              }
            }
          } else {
            logger.error("action_blocks elements length was not 2. wonder who changed 'user_rating_actions_' view? ");
          }
        }
      });
  
      // push comment modal
      if (my_rating_info.data.need_comment) {
        await slackApi.viewsPush(client, {
          token: context.botToken,
          trigger_id: body.trigger_id,
          view: await userRateCommentModalViews(userinfo, ratingItem, my_rating_info, params),
        });
      }
  
      const view = {
        type: 'modal',
        title: {
          type: 'plain_text',
          text: body.view.title.text,
        },
        blocks: body.view.blocks,
      };
  
      // redraw view blocks
      await slackApi.viewsUpdate(client, {
        token: context.botToken,
        view_id: body.view.id,
        view,
      });
  
      // record user rating to mongodb as history
      await updateHistory(ratingItem, history, params.score, logger);
    }
  } else {
    await slackApi.viewsOpen(client, {
      token: context.botToken,
      trigger_id: body.trigger_id,
      view: await errorModalViews(userinfo),
    });
  }
};

const userRateBadActionCallback = async ({ ack, body, client, context, logger }) => {
  try {
    await ack();
    if (body.container.type === 'message') {
      await rateBadFromMessage(body, client, context, logger);
    } else if (body.container.type === 'view') {
      await rateBadFromView(body, client, context, logger);
    }
  } catch (error) {
    logger.error(error);
  }
};

module.exports = { userRateBadActionCallback };

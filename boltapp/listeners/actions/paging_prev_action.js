const { slackApi, appApi } = require('../../webApi');
const { Database } = require('../../database');
const { moreModalViews } = require('./more_modal_view');

const pagingPrevActionCallback = async ({ ack, body, client, context, logger }) => {
  try {
    await ack();
    const userinfo = await slackApi.getUserInfo(client, body.user.id);
    const settings = await Database.getUserSettings(userinfo.user.id, logger);
    const from = parseInt(body.actions[0].value, 10) >= 0 ? parseInt(body.actions[0].value, 10) : 0;
    const message = {
      text: body.view.blocks[1].text.text,
    };
    const recommends = await appApi.troubleSearch(settings.size, settings.min_score, from, message);
    await slackApi.viewsUpdate(client, {
      token: context.botToken,
      view_id: body.view.id,
      view: await moreModalViews(userinfo, settings, recommends, from, message),
    });
  } catch (error) {
    logger.error(error);
  }
};

module.exports = { pagingPrevActionCallback };

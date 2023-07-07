const { slackApi, appApi } = require('../../webApi');
const { Database } = require('../../database');
const { moreModalViews } = require('./more_modal_view');
const openMoreModalActionCallback = async ({ ack, body, client, context, logger }) => {
  try {
    await ack();
    const userinfo = await slackApi.getUserInfo(client, body.user.id);
    const message = {
      text: body.actions[0].value
    };
    const settings = await Database.getUserSettings(userinfo.user.id, logger);
    const from = settings.size;
    const recommends = await appApi.troubleSearch(settings.size, settings.min_score, from, message);
    await slackApi.viewsOpen(client, {
      token: context.botToken,
      trigger_id: body.trigger_id,
      view: await moreModalViews(userinfo, settings, recommends, from, message),
    });
  } catch (error) {
    logger.error(error);
  }
};

module.exports = { openMoreModalActionCallback };
const { slackApi, appApi } = require('../../webApi');
const { Database } = require('../../database');
const { moreModalViews } = require('./more_modal_view');
const { errorModalViews } = require('./error_modal_view');

const openMoreModalActionCallback = async ({ ack, body, client, context, logger }) => {
  try {
    await ack();
    const userinfo = await slackApi.getUserInfo(client, body.user.id);
    const params = JSON.parse(body.actions[0].value);
    const history = await Database.getHistory({
      channel: params.channel,
      client_msg_id: params.client_msg_id,
      user: userinfo.user.id,
    }, logger);
    if (history) {
      const message = {
        client_msg_id: history.client_msg_id,
        channel: history.channel,
        user: history.user,
        text: history.text,
      };
      const settings = await Database.getUserSettings(userinfo.user.id, logger);
      const from = settings.size;
      const recommends = await appApi.troubleSearch(settings.size, settings.min_score, from, message);
  
      // add recommends
      Object.values(recommends.data.hits).forEach((recommend) => {
        const h_recommend = (
          history.recommends.find(({ document_id }) => document_id === recommend.document_id));
          if (!h_recommend) {
            history.recommends.push(recommend);
          }
      });
      await Database.setHistory(history, logger);
  
      await slackApi.viewsOpen(client, {
        token: context.botToken,
        trigger_id: body.trigger_id,
        view: await moreModalViews(userinfo, settings, recommends, from, message),
      });
    } else {
      await slackApi.viewsOpen(client, {
        token: context.botToken,
        trigger_id: body.trigger_id,
        view: await errorModalViews(userinfo),
      });
    }
  } catch (error) {
    logger.error(error);
  }
};

module.exports = { openMoreModalActionCallback };

const { slackApi, appApi } = require('../../webApi');
const { Database } = require('../../database');
const { moreModalViews } = require('./more_modal_view');

const pagingNextActionCallback = async ({ ack, body, client, context, logger }) => {
  try {
    await ack();
    const userinfo = await slackApi.getUserInfo(client, body.user.id);
    const settings = await Database.getUserSettings(userinfo.user.id, logger);
    const params = JSON.parse(body.actions[0].value);
    const history = await Database.getHistory({
      channel: params.channel,
      client_msg_id: params.client_msg_id,
      user: userinfo.user.id,
    }, logger);
    const message = {
      client_msg_id: history.client_msg_id,
      channel: history.channel,
      user: history.user,
      text: history.text,
    };
    const recommends = await appApi.troubleSearch(
      settings.size,
      settings.min_score,
      params.from,
      message,
    );

    // add recommends
    Object.values(recommends.data.hits).forEach((recommend) => {
      const h_recommend = (
        history.recommends.find(({ document_id }) => document_id === recommend.document_id));
        if (!h_recommend) {
          history.recommends.push(recommend);
        }
    });
    await Database.setHistory(history, logger);

    await slackApi.viewsUpdate(client, {
      token: context.botToken,
      view_id: body.view.id,
      view: await moreModalViews(userinfo, settings, recommends, params.from, message),
    });
  } catch (error) {
    logger.error(error);
  }
};

module.exports = { pagingNextActionCallback };

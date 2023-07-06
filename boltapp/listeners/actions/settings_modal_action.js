const { slackApi } = require('../../webApi');
const { settingsModalViews } = require('./settings_modal_view');
const openSettingsModalActionCallback = async ({ ack, body, client, context, logger }) => {
  try {
    await ack();
    const userinfo = await slackApi.getUserInfo(client, body.user.id);
    await client.views.open({
      token: context.botToken,
      trigger_id: body.trigger_id,
      view: await settingsModalViews(userinfo, logger),
    });
  } catch (error) {
    logger.error(error);
  }
};

module.exports = { openSettingsModalActionCallback };

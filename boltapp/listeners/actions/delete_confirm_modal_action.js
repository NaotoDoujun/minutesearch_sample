const { slackApi } = require('../../webApi');
const { deleteConfirmModalViews } = require('./delete_confirm_modal_view');

const openDeleteConfirmModalActionCallback = async ({ ack, body, client, context, logger }) => {
  try {
    await ack();
    const userinfo = await slackApi.getUserInfo(client, body.user.id);
    await slackApi.viewsOpen(client, {
      token: context.botToken,
      trigger_id: body.trigger_id,
      view: await deleteConfirmModalViews(userinfo),
    });
  } catch (error) {
    logger.error(error);
  }
};

module.exports = { openDeleteConfirmModalActionCallback };

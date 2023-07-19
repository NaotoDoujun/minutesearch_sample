const { slackApi } = require('../../webApi');
const { joinChannelsModalViews } = require('./join_channels_modal_view');

const openJoinChannelsModalActionCallback = async ({ ack, body, client, context, logger }) => {
  try {
    await ack();
    const userinfo = await slackApi.getUserInfo(client, body.user.id);
    const channellist = await slackApi.getChannelList(client);
    await slackApi.viewsOpen(client, {
      token: context.botToken,
      trigger_id: body.trigger_id,
      view: await joinChannelsModalViews(userinfo, channellist),
    });
  } catch (error) {
    logger.error(error);
  }
};

module.exports = { openJoinChannelsModalActionCallback };

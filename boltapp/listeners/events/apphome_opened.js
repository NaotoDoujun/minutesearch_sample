const { slackApi } = require('../../webApi');
const { apphomeBlocks } = require('./apphome_view');

const appHomeOpenedCallback = async ({ client, event, logger }) => {
  // Ignore the `app_home_opened` event for anything but the Home tab
  if (event.tab !== 'home') return;

  try {
    const userinfo = await slackApi.getUserInfo(client, event.user);
    const blocks = await apphomeBlocks(userinfo, event);
    await client.views.publish({
      user_id: event.user,
      view: {
        type: 'home',
        blocks: blocks
      },
    });
  } catch (error) {
    logger.error(error);
  }
};

module.exports = { appHomeOpenedCallback };

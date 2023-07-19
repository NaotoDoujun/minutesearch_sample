const { slackApi, appApi } = require('../../webApi');
const { config } = require('../../config');

const deleteUserRatingViewCallback = async ({ ack, client, body, logger }) => {
  try {
    await ack();
    const userinfo = await slackApi.getUserInfo(client, body.user.id);
    // delete all recommends on target channel
    const targetChannelName = userinfo.user.locale === 'ja-JP' ? config.SLACK_CHANNEL_NAME_JP : config.SLACK_CHANNEL_NAME_EN;
    slackApi.cleanupChannelByName(client, config.SLACK_USER_TOKEN, targetChannelName, logger);
    // delete user-rating
    await appApi.troubleUserRatingDelete(config.BOT_NAME);
  } catch (error) {
    logger.error(error);
  }
};

module.exports = { deleteUserRatingViewCallback };

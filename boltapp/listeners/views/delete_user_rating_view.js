const { slackApi, appApi } = require('../../webApi');
const { i18n } = require('../../locales');
const { config } = require('../../config');

const deleteUserRatingViewCallback = async ({ ack, client, body, context, logger }) => {
  try {
    await ack();
    const userinfo = await slackApi.getUserInfo(client, body.user.id);
    if (userinfo.user.locale === 'ja-JP') {
      i18n.setLocale('ja');
    }
    // delete all recommends on target channel
    const targetChannelName = userinfo.user.locale === 'ja-JP' ? config.SLACK_CHANNEL_NAME_JP : config.SLACK_CHANNEL_NAME_EN;
    slackApi.cleanupChannelByName(client, config.SLACK_USER_TOKEN, targetChannelName, logger);
    // delete user-rating
    const result = await appApi.troubleUserRatingDelete(config.BOT_NAME);
    if ('ok' in result.data && result.data.ok) {
      await slackApi.viewsOpen(client, {
        token: context.botToken,
        trigger_id: body.trigger_id,
        view: {
          type: 'modal',
          title: {
            type: 'plain_text',
            text: i18n.__('delete_completed_modal_title'),
          },
          blocks: [
            {
              type: 'section',
              text: {
                type: 'plain_text',
                text: i18n.__('delete_completed_modal_description'),
                emoji: true,
              },
            },
          ],
        },
      });
    }

  } catch (error) {
    logger.error(error);
  }
};

module.exports = { deleteUserRatingViewCallback };

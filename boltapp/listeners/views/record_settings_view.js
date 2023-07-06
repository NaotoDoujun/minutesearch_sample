const { slackApi } = require('../../webApi');
const { Database } = require('../../database');
const { config } = require('../../config');

const recordSettingsViewCallback = async ({ ack, client, body, view, logger }) => {

  await ack();

  try {
    const userinfo = await slackApi.getUserInfo(client, body.user.id);
    const formValues = view.state.values;
    const settings = {
      id: userinfo.user.id,
      bot: config.BOT_NAME,
      size: parseInt(formValues.settings_size.size_input_action.value, 10),
      min_score: parseFloat(formValues.settings_min_score.minscore_input_action.value),
    };
    await Database.setUserSettings(settings, logger);
  } catch (error) {
    logger.error(error);
  }
};

module.exports = { recordSettingsViewCallback };

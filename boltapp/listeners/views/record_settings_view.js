const { slackApi } = require('../../webApi');
const { Database } = require('../../database');
const { i18n } = require('../../locales');
const { config } = require('../../config');

const isValidSize = (size) => {
  if (size >= 1 && size <= config.DEFAULT_MAX_SIZE) {
    return true;
  }
  return false;
};

const isValidMinScore = (min_score) => {
  if (min_score >= 0 && min_score <= config.DEFAULT_MAX_SCORE) {
    return true;
  }
  return false;
};

const recordSettingsViewCallback = async ({ ack, client, body, view, logger }) => {
  try {
    const userinfo = await slackApi.getUserInfo(client, body.user.id);
    if (userinfo.user.locale === 'ja-JP') {
      i18n.setLocale('ja');
    }
    const formValues = view.state.values;
    const settings = {
      id: userinfo.user.id,
      bot: config.BOT_NAME,
      size: parseInt(formValues.settings_size.size_input_action.value, 10),
      min_score: parseFloat(formValues.settings_min_score.minscore_input_action.value),
    };
    const validSize = isValidSize(settings.size);
    const validMinScore = isValidMinScore(settings.min_score);
    if (validSize && validMinScore) {
      await ack();
      await Database.setUserSettings(settings, logger);
    } else {
      const errors = {};
      if (!validSize) {
        errors.settings_size = i18n.__('size_error', { max_size: config.DEFAULT_MAX_SIZE });
      }
      if (!validMinScore) {
        errors.settings_min_score = i18n.__('min_score_error', { max_score: config.DEFAULT_MAX_SCORE });
      }
      await ack({ response_action: 'errors', errors });
    }
  } catch (error) {
    logger.error(error);
  }
};

module.exports = { recordSettingsViewCallback };

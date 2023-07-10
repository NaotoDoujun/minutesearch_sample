const { appApi, slackApi } = require('../../webApi');
const { i18n } = require('../../locales');

const isValidComment = (comment, check_input = true) => {
  if (check_input) {
    if (comment) {
      return true;
    }
    return false;
  }
  return true;
};

const recordUserRateCommentViewCallback = async ({ ack, client, body, view, logger }) => {
  try {
    const userinfo = await slackApi.getUserInfo(client, body.user.id);
    if (userinfo.user.locale === 'ja-JP') {
      i18n.setLocale('ja');
    }
    const formValues = view.state.values;
    const metadatas = view.private_metadata.split(':');
    const comment = formValues.user_rate_comment_text.user_rate_comment_plain_text_input.value ?? '';
    const commentItem = {
      document_id: metadatas[0],
      user_id: userinfo.user.id,
      rate_type: metadatas[1],
      comment,
    };

    const validComment = isValidComment(commentItem.comment, false);
    if (validComment) {
      await ack();
      await appApi.troubleRecordComment(commentItem);
    } else {
      const errors = {};
      if (!validComment) {
        errors.user_rate_comment_text = i18n.__('comment_error');
      }
      await ack({ response_action: 'errors', errors });
    }
  } catch (error) {
    logger.error(error);
  }
};

module.exports = { recordUserRateCommentViewCallback };

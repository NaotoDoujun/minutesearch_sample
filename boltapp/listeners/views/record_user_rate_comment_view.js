const { appApi, slackApi } = require('../../webApi');
const { Database } = require('../../database');
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

const updateHistory = async (commentItem, history) => {
  const recommend = (
    history.recommends.find(({ document_id }) => document_id === commentItem.document_id));
  if (recommend) {
    const my_rating_info = (
      recommend.rated_users.find(({ user }) => user === commentItem.user_id));
    if (my_rating_info) {
      if (commentItem.rate_type === 'good') {
        my_rating_info.positive_comment = commentItem.comment;
      }
      if (commentItem.rate_type === 'bad') {
        my_rating_info.negative_comment = commentItem.comment;
      }
    }
  }
  await Database.setHistory(history);
};

const recordUserRateCommentViewCallback = async ({ ack, client, body, view, logger }) => {
  try {
    const userinfo = await slackApi.getUserInfo(client, body.user.id);
    if (userinfo.user.locale === 'ja-JP') {
      i18n.setLocale('ja');
    }
    const formValues = view.state.values;
    const metadata = JSON.parse(view.private_metadata);
    const comment = formValues.user_rate_comment_text.user_rate_comment_plain_text_input.value ?? '';
    const commentItem = {
      document_id: metadata.document_id,
      user_id: userinfo.user.id,
      rate_type: metadata.rate_type,
      comment,
    };

    const validComment = isValidComment(commentItem.comment, false);
    if (validComment) {
      await ack();
      // record comment to elasticsearch as original resource
      await appApi.troubleRecordComment(commentItem);
      const history = await Database.getHistory({
        channel: metadata.channel,
        client_msg_id: metadata.client_msg_id,
        user: userinfo.user.id,
      });
      // record comment to mongodb as history
      await updateHistory(commentItem, history);
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

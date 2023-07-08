const { i18n } = require('../../locales');

const userRateCommentModalViews = async (userinfo, ratingItem, my_rating_info) => {
  if (userinfo.user.locale === 'ja-JP') {
    i18n.setLocale('ja');
  }
  const title_txt = i18n.__('user_rating_comment_title');
  const submit_txt = i18n.__('submit');
  const label_comment_txt = my_rating_info.data.positive ? i18n.__('good_comment_label') : i18n.__('bad_comment_label');
  const placeholder_txt = i18n.__('comment_placeholder');
  const my_rating = my_rating_info.data;
  const my_comment = my_rating.positive ? my_rating.positive_comment : my_rating.negative_comment;
  const view = {
    type: 'modal',
    private_metadata: `${ratingItem.document_id}:${ratingItem.rate_type}`,
    callback_id: 'user-rate-comment',
    clear_on_close: true,
    title: {
      type: 'plain_text',
      text: title_txt,
    },
    submit: {
      type: 'plain_text',
      text: submit_txt,
    },
    blocks: [
      {
        type: 'input',
        optional: true,
        block_id: 'user_rate_comment_text',
        element: {
          type: 'plain_text_input',
          action_id: 'user_rate_comment_plain_text_input',
          multiline: true,
          initial_value: my_comment,
          placeholder: {
            type: 'plain_text',
            text: placeholder_txt,
          },
        },
        label: {
          type: 'plain_text',
          text: label_comment_txt,
          emoji: true,
        },
      },
    ],
  };
  return view;
};

module.exports = { userRateCommentModalViews };

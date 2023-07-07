const userRateCommentModalViews = async (userinfo, ratingItem, my_rating_info) => {
    const title_txt = 'User Rating Comment';
    const submit_txt = 'Submit';
    const label_comment_txt = my_rating_info.data.positive ? 'Good Reason Comment' : 'Bad Reason Comment';
    const placeholder_txt = 'Please enter the reason.';
    const my_comment = my_rating_info.data.positive ? my_rating_info.data.positive_comment : my_rating_info.data.negative_comment;
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
                    }
                },
                label: {
                    type: 'plain_text',
                    text: label_comment_txt,
                    emoji: true,
                }
            }
        ]
    };
    return view;
};

module.exports = { userRateCommentModalViews };

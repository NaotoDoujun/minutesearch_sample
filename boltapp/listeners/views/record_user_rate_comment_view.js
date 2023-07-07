const { appApi, slackApi } = require('../../webApi');

const isValidComment = (comment, check_input = true) => {
    if (check_input) {
        if (comment) {
            return true;
        } else {
            return false;
        }
    } else {
        return true;
    }
};

const recordUserRateCommentViewCallback = async ({ ack, client, body, view, logger }) => {
    try {
        const userinfo = await slackApi.getUserInfo(client, body.user.id);
        const comment_error_txt = 'Plese enter the reason.';
        const formValues = view.state.values;
        const metadatas = view.private_metadata.split(':');
        const commentItem = {
            document_id: metadatas[0],
            user_id: userinfo.user.id,
            rate_type: metadatas[1],
            comment: formValues.user_rate_comment_text.user_rate_comment_plain_text_input.value ? formValues.user_rate_comment_text.user_rate_comment_plain_text_input.value : '',
        };

        const validComment = isValidComment(commentItem.comment, false);
        if (validComment) {
            await ack();
            await appApi.troubleRecordComment(commentItem);
        } else {
            const errors = {};
            if (!validComment) {
                errors.user_rate_comment_text = comment_error_txt;
            }
            await ack({ response_action: 'errors', errors: errors });
        }

    } catch (error) {
        logger.error(error);
    }
};

module.exports = { recordUserRateCommentViewCallback };

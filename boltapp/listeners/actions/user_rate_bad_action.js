const { appApi, slackApi } = require('../../webApi');
const { userRateCommentModalViews } = require('./user_rate_comment_modal_view');

const rateBadFromMessage = async (body, client, context, logger) => {
    const userinfo = await slackApi.getUserInfo(client, body.user.id);
    const channel_id = body.container.channel_id;
    const ts = body.message.ts;
    const ratingItem = {
        document_id: body.actions[0].value,
        user_id: userinfo.user.id,
        user_name: `${userinfo.user.real_name} / ${userinfo.user.name}`,
        rate_type: 'bad',
    };
    const my_rating_info = await appApi.troubleUserRate(ratingItem);
    if (my_rating_info) {
        const score_block_id = `user_rating_score_${ratingItem.document_id}`;
        const actions_block_id = `user_rating_actions_${ratingItem.document_id}`;
        const notify_txt = 'Pressed Bad Button.';

        body.message.blocks.forEach(block => {
            // update score block
            if (block.block_id === score_block_id) {
                if (block.elements && block.elements.length === 1) {
                    if ('text' in block.elements[0]) {
                        block.elements[0].text = `User Rating Score: ${my_rating_info.data.rating}`;
                    }
                } else {
                    logger.error("score_blocks elements length was not 1. wonder who changed 'user_rating_score_' view? ");
                }
            }
            // update action block
            if (block.block_id === actions_block_id) {
                if (block.elements && block.elements.length === 2) {
                    if ('action_id' in block.elements[0] && block.elements[0].action_id === 'user_rate_good_button') {
                        // edit style property
                        if (my_rating_info.data.positive) {
                            block.elements[0].style = 'primary';
                        } else {
                            if ('style' in block.elements[0]) {
                                delete block.elements[0].style;
                            }
                        }
                    }
                    if ('action_id' in block.elements[1] && block.elements[1].action_id === 'user_rate_bad_button') {
                        // edit style property
                        if (my_rating_info.data.negative) {
                            block.elements[1].style = 'danger';
                        } else {
                            if ('style' in block.elements[1]) {
                                delete block.elements[1].style;
                            }
                        }
                    }
                } else {
                    logger.error("action_blocks elements length was not 2. wonder who changed 'user_rating_actions_' view? ");
                }
            }
        });

        // redaraw message blocks
        await client.chat.update({
            channel: channel_id,
            ts: ts,
            text: notify_txt,
            blocks: body.message.blocks,
        });

        // open modal
        if (my_rating_info.data.need_comment) {
            await client.views.open({
                token: context.botToken,
                trigger_id: body.trigger_id,
                view: await userRateCommentModalViews(userinfo, ratingItem, my_rating_info),
            });
        }
    }
};

const rateBadFromView = async (body, client, context, logger) => {
    const userinfo = await slackApi.getUserInfo(client, body.user.id);
    const ratingItem = {
        document_id: body.actions[0].value,
        user_id: userinfo.user.id,
        user_name: `${userinfo.user.real_name} / ${userinfo.user.name}`,
        rate_type: 'bad',
    };
    const my_rating_info = await appApi.troubleUserRate(ratingItem);
    if (my_rating_info) {
        const score_block_id = `user_rating_score_${ratingItem.document_id}`;
        const actions_block_id = `user_rating_actions_${ratingItem.document_id}`;

        body.view.blocks.forEach(block => {
            // update score block
            if (block.block_id === score_block_id) {
                if (block.elements && block.elements.length === 1) {
                    if ('text' in block.elements[0]) {
                        block.elements[0].text = `User Rating Score: ${my_rating_info.data.rating}`;
                    }
                } else {
                    logger.error("score_blocks elements length was not 1. wonder who changed 'user_rating_score_' view? ");
                }
            }
            // update action block
            if (block.block_id === actions_block_id) {
                if (block.elements && block.elements.length === 2) {
                    if ('action_id' in block.elements[0] && block.elements[0].action_id === 'user_rate_good_button') {
                        // edit style property
                        if (my_rating_info.data.positive) {
                            block.elements[0].style = 'primary';
                        } else {
                            if ('style' in block.elements[0]) {
                                delete block.elements[0].style;
                            }
                        }
                    }
                    if ('action_id' in block.elements[1] && block.elements[1].action_id === 'user_rate_bad_button') {
                        // edit style property
                        if (my_rating_info.data.negative) {
                            block.elements[1].style = 'danger';
                        } else {
                            if ('style' in block.elements[1]) {
                                delete block.elements[1].style;
                            }
                        }
                    }
                } else {
                    logger.error("action_blocks elements length was not 2. wonder who changed 'user_rating_actions_' view? ");
                }
            }
        });

        const view = {
            type: 'modal',
            external_id: 'more_modal',
            title: {
                type: 'plain_text',
                text: body.view.title.text,
            },
            blocks: body.view.blocks
        };

        // redraw view blocks
        await client.views.update({
            token: context.botToken,
            external_id: body.view.external_id,
            view: view,
        });

        // open modal
        if (my_rating_info.data.need_comment) {
            await client.views.push({
                token: context.botToken,
                trigger_id: body.trigger_id,
                view: await userRateCommentModalViews(userinfo, ratingItem, my_rating_info),
            });
        }
    }
};

const userRateBadActionCallback = async ({ ack, body, client, context, logger }) => {
    try {
        ack();
        if (body.container.type === 'message') {
            await rateBadFromMessage(body, client, context, logger);
        } else if (body.container.type === 'view') {
            await rateBadFromView(body, client, context, logger);
        }
    } catch (error) {
        logger.error(error);
    }
};

module.exports = { userRateBadActionCallback };

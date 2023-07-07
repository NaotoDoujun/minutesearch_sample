const { appApi, slackApi } = require('../../webApi');
const { i18n } = require('../../locales');
const { userRateCommentModalViews } = require('./user_rate_comment_modal_view');

const rateGoodFromMessage = async (body, client, context, logger) => {
    const userinfo = await slackApi.getUserInfo(client, body.user.id);
    userinfo.user.locale === 'ja-JP' ? i18n.setLocale('ja') : i18n.setLocale('en');
    const channel_id = body.container.channel_id;
    const ts = body.message.ts;
    const ratingItem = {
        document_id: body.actions[0].value,
        user_id: userinfo.user.id,
        user_name: `${userinfo.user.real_name} / ${userinfo.user.name}`,
        rate_type: 'good',
    };
    const my_rating_info = await appApi.troubleUserRate(ratingItem);
    if (my_rating_info) {
        const score_block_id = `user_rating_score_${ratingItem.document_id}`;
        const actions_block_id = `user_rating_actions_${ratingItem.document_id}`;
        const notify_txt = i18n.__('notify_pressed_good');

        body.message.blocks.forEach(block => {
            // update score block
            if (block.block_id === score_block_id) {
                if (block.elements && block.elements.length === 1) {
                    if ('text' in block.elements[0]) {
                        block.elements[0].text = i18n.__('user_rating_score', { rating: my_rating_info.data.rating });
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
        await slackApi.chatUpdate(client, {
            channel: channel_id,
            ts: ts,
            text: notify_txt,
            blocks: body.message.blocks,
        });

        // open comment modal
        if (my_rating_info.data.need_comment) {
            await slackApi.viewsOpen(client, {
                token: context.botToken,
                trigger_id: body.trigger_id,
                view: await userRateCommentModalViews(userinfo, ratingItem, my_rating_info),
            });
        }
    }
};

const rateGoodFromView = async (body, client, context, logger) => {
    const userinfo = await slackApi.getUserInfo(client, body.user.id);
    const ratingItem = {
        document_id: body.actions[0].value,
        user_id: userinfo.user.id,
        user_name: `${userinfo.user.real_name} / ${userinfo.user.name}`,
        rate_type: 'good',
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
                        block.elements[0].text = i18n.__('user_rating_score', { rating: my_rating_info.data.rating });
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
        await slackApi.viewsUpdate(client, {
            token: context.botToken,
            external_id: body.view.external_id,
            view: view,
        });

        // push comment modal
        if (my_rating_info.data.need_comment) {
            await slackApi.viewsPush(client, {
                token: context.botToken,
                trigger_id: body.trigger_id,
                view: await userRateCommentModalViews(userinfo, ratingItem, my_rating_info),
            });
        }
    }
};

const userRateGoodActionCallback = async ({ ack, body, client, context, logger }) => {
    try {
        await ack();
        if (body.container.type === 'message') {
            await rateGoodFromMessage(body, client, context, logger);
        } else if (body.container.type === 'view') {
            await rateGoodFromView(body, client, context, logger);
        }
    } catch (error) {
        logger.error(error);
    }
};

module.exports = { userRateGoodActionCallback };

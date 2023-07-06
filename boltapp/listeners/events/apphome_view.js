const apphomeBlocks = async(userinfo, event) => {
    const greeting_txt = `*Welcome home, <@${event.user}> :house:*`;
    const settings_txt = 'Settings';
    const settings_description_txt = 'Set maximum number of display size and minimum score threshold.';
    const settings_open_button_txt = 'Open Setting Modal';
    const blocks = [
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: greeting_txt
            },
        },
        { type: 'divider' },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: settings_txt,
            },
            fields: [
                {
                    type: 'mrkdwn',
                    text: settings_description_txt,
                }
            ],
            accessory: {
                type: 'button',
                text: {
                    type: 'plain_text',
                    text: settings_open_button_txt,
                },
                style: 'primary',
                value: 'clicked',
                action_id: 'open_settings_modal_button',
            }
        },
        { type: 'divider' }
    ];
    return blocks;
};

module.exports = { apphomeBlocks };
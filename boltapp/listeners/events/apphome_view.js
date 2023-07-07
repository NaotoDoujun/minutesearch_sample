const { i18n } = require('../../locales');
const apphomeBlocks = async(userinfo, event) => {
    userinfo.user.locale === 'ja-JP' ? i18n.setLocale('ja') : i18n.setLocale('en');
    const greeting_txt = i18n.__('greeting', { user: event.user });
    const settings_txt = i18n.__('settings_title');
    const settings_description_txt = i18n.__('settings_description');
    const settings_open_button_txt = i18n.__('settings_open_button');
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

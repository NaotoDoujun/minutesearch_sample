const { appApi, slackApi } = require('../../webApi');
const { Database } = require('../../database');
const { i18n } = require('../../locales');
const { troubleShootBlocks } = require('./troubleshoot_view');
const { config } = require('../../config');

const joinChannel = async (client, channel_name, logger) => {
  let join = { ok: false, is_archived: false };
  try {
    const channel = await slackApi.getChannelByName(client, channel_name);
    join = await slackApi.joinChannel(client, channel.id);
  } catch (error) {
    switch (error.data.error) {
      case 'is_archived':
        join.is_archived = true;
        break;
      default:
        logger.error(error);
    }
  }
  return join;
};

const createChannel = async (client, channel_name, logger) => {
  let created = { ok: false };
  try {
    const channel = await slackApi.createChannel(client, channel_name);
    const members = await slackApi.getActiveMembers(client);
    created = await slackApi.inviteMembers(client, channel.id, members.join(','));
  } catch (error) {
    logger.error(error);
  }
  return created;
};

const recursivePostMessage = async (client, message, logger) => {
  let result = { ok: false, is_archived: false };
  try {
    result = await slackApi.chatPostMessage(client, message);
  } catch (error) {
    switch (error.data.error) {
      case 'not_in_channel': {
        const join = await joinChannel(client, message.channel, logger);
        result.is_archived = join.is_archived;
        if (join.ok) {
          result = await recursivePostMessage(client, message, logger);
        }
        break;
      }
      case 'channel_not_found': {
        const create = await createChannel(client, message.channel, logger);
        if (create.ok) {
          result = await recursivePostMessage(client, message, logger);
        }
        break;
      }
      default:
        logger.error(error);
    }
  }
  return result;
};

const troubleShootMessageCallback = async ({ message, client, say, logger }) => {
  try {
    const userinfo = await slackApi.getUserInfo(client, message.user);
    userinfo.user.locale === 'ja-JP' ? i18n.setLocale('ja') : i18n.setLocale('en');
    const targetChannelName = userinfo.user.locale === 'ja-JP' ? config.SLACK_CHANNEL_NAME_JP : config.SLACK_CHANNEL_NAME_EN;
    const settings = await Database.getUserSettings(message.user, logger);
    const recommends = await appApi.troubleSearch(settings.size, settings.min_score, 0, message);
    const blocks = await troubleShootBlocks(userinfo, settings, message, recommends);
    if (recommends.data.total.value > 0) {
      if (message.channel_type !== 'channel') {
        await say({
          blocks,
          text: i18n.__('recommends_hit_count', { total: recommends.data.total.value }),
          thread_ts: message.ts,
        });
      } else {
        // target channel have to be name cuz this script going to create the channel when its nothing.
        const user_message = {
          channel: targetChannelName,
          username: userinfo.user.profile.display_name ? userinfo.user.profile.display_name : userinfo.user.name,
          icon_url: userinfo.user.profile.image_48,
          text: `<#${message.channel}>: ${message.text}`,
        };

        const user_result = await recursivePostMessage(client, user_message, logger);
        if (user_result.ok) {
          const bot_message = {
            channel: targetChannelName,
            blocks,
            text: i18n.__('recommends_hit_count', { total: recommends.data.total.value }),
            thread_ts: user_result.ts,
          };
          const bot_result = await recursivePostMessage(client, bot_message, logger);
          if (!bot_result.ok && 'is_archived' in bot_result && bot_result.is_archived) {
            await say({ text: i18n.__('channel_archived', { channel: targetChannelName }) });
          }
        } else if (!user_result.ok && 'is_archived' in user_result && user_result.is_archived) {
          await say({ text: i18n.__('channel_archived', { channel: targetChannelName }) });
        }
      }
    }
  } catch (error) {
    logger.error(error);
  }
};

module.exports = { troubleShootMessageCallback };

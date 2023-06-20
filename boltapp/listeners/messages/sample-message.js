const { config } = require('../../config');
const { appApi, slackApi } = require('../../webApi');
const { Database } = require('../../database');
const { sampleBlocks } = require('./sample-blocks');

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
    result = await client.chat.postMessage(message);
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

const sampleMessageCallback = async ({ message, client, say, logger }) => {
  try {
    const userInfo = await slackApi.getUserInfo(client, message.user);
    const settings = await Database.getUserSettings(message.user);
    const recommends = await appApi.troubleSearch(settings.size, settings.min_score, message);
    const blocks = await sampleBlocks(userInfo, recommends.data.hits);
    if (recommends.data.total.value > 0) {
      if (message.channel_type !== 'channel') {
        await say({
          blocks,
          text: `${recommends.data.total.value} recommends hit`,
          thread_ts: message.ts,
        });
      } else {
        // target channel have to be name cuz this script going to create the channel when its nothing.
        const user_message = {
          channel: config.SLACK_CHANNEL_NAME_JP,
          username: userInfo.user.profile.display_name ? userInfo.user.profile.display_name : userInfo.user.name,
          icon_url: userInfo.user.profile.image_48,
          text: `<#${message.channel}>: ${message.text}`,
        };

        const user_result = await recursivePostMessage(client, user_message, logger);
        if (user_result.ok) {
          const bot_message = {
            channel: config.SLACK_CHANNEL_NAME_JP,
            blocks,
            text: `${recommends.data.total.value} recommends hit`,
            thread_ts: user_result.ts,
          };
          const bot_result = await recursivePostMessage(client, bot_message, logger);
          if (!bot_result.ok && 'is_archived' in bot_result && bot_result.is_archived) {
            await say({ text: `target channel: ${config.SLACK_CHANNEL_NAME_JP} is archived.` });
          }
        } else if (!user_result.ok && 'is_archived' in user_result && user_result.is_archived) {
          await say({ text: `target channel: ${config.SLACK_CHANNEL_NAME_JP} is archived.` });
        }
      }
    }
  } catch (error) {
    logger.error(error);
  }
};

module.exports = { sampleMessageCallback };

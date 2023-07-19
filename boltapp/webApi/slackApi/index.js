/**
 * getChannelList
 * @param {*} client
 * @returns
 *
 * Tier 2
 */
const getChannelList = async (client) => {
  const result = await client.conversations.list();
  return result;
};

/**
 * getChannelById
 * @param {*} client
 * @param {*} channelId
 * @returns
 *
 * Tier 2
 */
const getChannelById = async (client, channelId) => {
  const list = await getChannelList(client);
  const channel = list.channels.find((conversation) => conversation.id === channelId);
  return typeof channel === 'undefined' ? { id: channelId, name: '', is_channel: false } : channel;
};

/**
 * getChannelByName
 * @param {*} client
 * @param {*} channelName
 * @returns
 *
 * Tier 2
 */
const getChannelByName = async (client, channelName) => {
  const list = await getChannelList(client);
  const channels = list.channels.filter((conversation) => conversation.name === channelName);
  return channels.length > 0 ? channels[0] : null;
};

/**
 * getChannelInfo
 * @param {*} client
 * @param {*} channelId
 * @returns
 *
 * Tier 3
 */
const getChannelInfo = async (client, channelId) => {
  const result = await client.conversations.info({ channel: channelId });
  return result;
};

/**
 * cleanupChannelByName
 * @param {*} client
 * @param {*} channelName
 * @param {*} logger
 *
 * Tier2, 3
 */
const cleanupChannelByName = async (client, userToken, channelName, logger) => {
  const target = await getChannelByName(client, channelName);
  if (target) {
    const history = await client.conversations.history({ channel: target.id });
    Object.values(history.messages).forEach(async (h_message) => {
      const replies = await client.conversations.replies({ channel: target.id, ts: h_message.ts });
      Object.values(replies.messages).forEach(async (r_message) => {
        try {
          // need user token chat:write
          await client.chat.delete({
            token: userToken,
            channel: target.id,
            ts: r_message.ts,
            as_user: true,
          });
        } catch (r_error) {
          logger.error(r_error);
        }
      });
      try {
        // need user token chat:write
        await client.chat.delete({
          token: userToken,
          channel: target.id,
          ts: h_message.ts,
          as_user: true,
        });
      } catch (h_error) {
        logger.error(h_error);
      }
    });
  }
};

/**
 * getActiveMembers
 * @param {*} client
 * @returns
 *
 * Tier 2
 */
const getActiveMembers = async (client) => {
  const users = await client.users.list();
  return users.members.filter((user) => !user.deleted && !user.is_bot && user.is_email_confirmed)
    .map((user) => user.id);
};

/**
 * getUserInfo
 * @param {*} client
 * @param {*} userId
 * @returns
 *
 * Tier 4
 */
const getUserInfo = async (client, userId) => {
  const result = await client.users.info({
    user: userId,
    include_locale: true,
  });
  return result;
};

/**
 * createChannel
 * @param {*} client
 * @param {*} channelName
 * @returns
 *
 * Tier 2
 */
const createChannel = async (client, channelName) => {
  const result = await client.conversations.create({ name: channelName });
  return result.ok ? result.channel : null;
};

/**
 * inviteMembers
 * @param {*} client
 * @param {*} channnelId
 * @param {*} members
 * @returns
 *
 * Tier 3
 */
const inviteMembers = async (client, channnelId, members) => {
  const result = await client.conversations.invite({ channel: channnelId, users: members });
  return result;
};

/**
 * isMember
 * @param {*} client
 * @param {*} channelId
 * @param {*} userId
 * @returns
 *
 * Tier 4
 */
const isMember = async (client, channelId, userId) => {
  const members = await client.conversations.members({ channel: channelId });
  return members.members.includes(userId);
};

/**
 * joinChannel
 * @param {*} client
 * @param {*} channelId
 * @returns
 *
 * Tier 3
 */
const joinChannel = async (client, channelId) => {
  const result = await client.conversations.join({ channel: channelId });
  return result;
};

/**
 * chatPostMessage
 * @param {*} client
 * @param {*} message
 * @returns
 *
 * Special Tier
 * generally allows posting one message per second per channel,
 * while also maintaining a workspace-wide limit.
 */
const chatPostMessage = async (client, message) => {
  const result = await client.chat.postMessage(message);
  return result;
};

/**
 * chatUpdate
 * @param {*} client
 * @param {*} params
 * @returns
 *
 * Tier 3
 */
const chatUpdate = async (client, params) => {
  const result = await client.chat.update(params);
  return result;
};

/**
 * viewsOpen
 * @param {*} client
 * @param {*} params
 * @returns
 *
 * Tier 4
 */
const viewsOpen = async (client, params) => {
  const result = await client.views.open(params);
  return result;
};

/**
 * viewsPublish
 * @param {*} client
 * @param {*} params
 * @returns
 *
 * Tier 4
 */
const viewsPublish = async (client, params) => {
  const result = await client.views.publish(params);
  return result;
};

/**
 * viewsUpdate
 * @param {*} client
 * @param {*} params
 * @returns
 *
 * Tier 4
 */
const viewsUpdate = async (client, params) => {
  const result = await client.views.update(params);
  return result;
};

/**
 * viewsPush
 * @param {*} client
 * @param {*} params
 * @returns
 *
 * Tier 4
 */
const viewsPush = async (client, params) => {
  const result = await client.views.push(params);
  return result;
};

module.exports = {
  getChannelList,
  getChannelById,
  getChannelByName,
  getChannelInfo,
  cleanupChannelByName,
  getActiveMembers,
  getUserInfo,
  createChannel,
  inviteMembers,
  isMember,
  joinChannel,
  chatPostMessage,
  chatUpdate,
  viewsPublish,
  viewsOpen,
  viewsUpdate,
  viewsPush,
};

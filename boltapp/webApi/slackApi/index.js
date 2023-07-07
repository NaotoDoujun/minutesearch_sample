/**
 *
 * @param {*} client
 * @param {*} channelId
 * @returns
 *
 * Tier 2
 */
const getChannelById = async (client, channelId) => {
  const list = await client.conversations.list();
  const channel = list.channels.find((conversation) => conversation.id === channelId);
  return typeof channel === 'undefined' ? { id: channelId, name: '', is_channel: false } : channel;
};

/**
 *
 * @param {*} client
 * @param {*} channelName
 * @returns
 *
 * Tier 2
 */
const getChannelByName = async (client, channelName) => {
  const list = await client.conversations.list();
  const channels = list.channels.filter((conversation) => conversation.name === channelName);
  return channels.length > 0 ? channels[0] : null;
};

/**
 *
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
 *
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
 *
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
 *
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
 *
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
 *
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
 * 
 * @param {*} client 
 * @param {*} message 
 * @returns 
 * 
 * Special Tier 
 * generally allows posting one message per second per channel, while also maintaining a workspace-wide limit.
 */
const chatPostMessage = async (client, message) => {
  const result = await client.chat.postMessage(message);
  return result;
};

/**
 * 
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
 * 
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
 * 
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
 * 
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
 * 
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
  getChannelById,
  getChannelByName,
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

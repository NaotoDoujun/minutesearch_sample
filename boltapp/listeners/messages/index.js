const { troubleShootMessageCallback } = require('./troubleshoot_message');

const filterMessage = async ({ message, next }) => {
  if ('client_msg_id' in message
    && 'channel' in message
    && 'user' in message
    && !('subtype' in message)
  ) {
    await next();
  }
};

module.exports.register = (app) => {
  app.message(filterMessage, troubleShootMessageCallback);
};

const { troubleShootMessageCallback } = require('./troubleshoot_message');

const noBotMessage = async ({ message, next }) => {
  if (!message.subtype || (message.subtype !== 'bot_message' && message.subtype !== 'message_changed')) {
    await next();
  }
};

module.exports.register = (app) => {
  app.message(noBotMessage, troubleShootMessageCallback);
};

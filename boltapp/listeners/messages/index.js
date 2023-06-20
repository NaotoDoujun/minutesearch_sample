const { sampleMessageCallback } = require('./sample-message');

const noBotMessage = async ({ message, next }) => {
  if (!message.subtype || message.subtype !== 'bot_message') {
    await next();
  }
};

module.exports.register = (app) => {
  app.message(noBotMessage, sampleMessageCallback);
};

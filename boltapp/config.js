require('dotenv').config();

const config = {
  NODE_ENV: process.env.NODE_ENV,
  BOT_NAME: process.env.BOT_NAME || 'slackbot',
  BOT_PORT: process.env.BOT_PORT || 3000,
  SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
  SLACK_USER_TOKEN: process.env.SLACK_USER_TOKEN,
  SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET,
  SLACK_APP_TOKEN: process.env.SLACK_APP_TOKEN,
  SLACK_SOCKET_MODE: process.env.SLACK_SOCKET_MODE || true,
  SLACK_CHANNEL_NAME_JP: process.env.SLACK_CHANNEL_NAME_JP || 'something',
  SLACK_CHANNEL_NAME_EN: process.env.SLACK_CHANNEL_NAME_EN || 'something',
  APPAPI_HOST: process.env.NODE_ENV === 'production' ? 'appapi:8000' : 'localhost:8065',
  MONGODB_HOST: process.env.NODE_ENV === 'production' ? 'mongodb:27017' : 'localhost:27017',
  DEFAULT_SIZE: process.env.DEFAULT_SIZE || 3,
  DEFAULT_MAX_SIZE: process.env.DEFAULT_MAX_SIZE || 5,
  DEFAULT_MIN_SCORE: process.env.DEFAULT_MIN_SCORE || 1.65,
  DEFAULT_MAX_SCORE: process.env.DEFAULT_MAX_SCORE || 2,
  GLOBAL_APPAPI_HOST: process.env.GLOBAL_APPAPI_HOST || 'localhost:8065',
};

module.exports = { config };

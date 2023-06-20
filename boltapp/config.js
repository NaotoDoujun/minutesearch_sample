require('dotenv').config();

const config = {
  NODE_ENV: process.env.NODE_ENV,
  BOT_NAME: process.env.BOT_NAME || 'slackbot',
  BOT_PORT: process.env.BOT_PORT || 3000,
  SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
  SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET,
  SLACK_APP_TOKEN: process.env.SLACK_APP_TOKEN,
  SLACK_SOCKET_MODE: process.env.SLACK_SOCKET_MODE || true,
  SLACK_CHANNEL_NAME_JP: process.env.SLACK_CHANNEL_NAME_JP || 'something',
  SLACK_CHANNEL_NAME_EN: process.env.SLACK_CHANNEL_NAME_EN || 'something',
  APPAPI_HOST: process.env.NODE_ENV === 'production' ? 'http://appapi:8000' : 'http://localhost:8065',
  MONGODB_HOST: process.env.NODE_ENV === 'production' ? 'mongodb:27017' : 'localhost:27017',
  DEFAULT_SIZE: process.env.DEFAULT_SIZE || 3,
  DEFAULT_MIN_SCORE: process.env.DEFAULT_MIN_SCORE || 1.0,
};

module.exports = { config };
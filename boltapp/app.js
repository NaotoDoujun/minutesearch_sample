const { App, LogLevel } = require('@slack/bolt');
const { registerListeners } = require('./listeners');
const { Database } = require('./database');
const { config } = require('./config');

/** Initialization */
const app = new App({
  token: config.SLACK_BOT_TOKEN,
  signingSecret: config.SLACK_SIGNING_SECRET,
  socketMode: config.SLACK_SOCKET_MODE,
  appToken: config.SLACK_APP_TOKEN,
  logLevel: LogLevel.DEBUG,
});

/** Register Listeners */
registerListeners(app);

/** Start Bolt App */
(async () => {
  try {
    await app.start(config.BOT_PORT);
    console.log('⚡️ Bolt app is running! ⚡️');
    await Database.connect();
  } catch (error) {
    console.error('Unable to start App', error);
  }
})();

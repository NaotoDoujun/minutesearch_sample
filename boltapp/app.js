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
  deferInitialization: true,
  port: config.BOT_PORT,
  logLevel: config.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
});

/** Register Listeners */
registerListeners(app);

/** Start Bolt App */
(async () => {
  try {
    await app.init();
    await Database.connect(app.logger);
    await app.start();
    app.logger.info('⚡️ Bolt app is running! ⚡️');
  } catch (error) {
    app.logger.error('Unable to start App', error);
  }
})();

const { appHomeOpenedCallback } = require('./apphome_opened');

module.exports.register = (app) => {
  app.event('app_home_opened', appHomeOpenedCallback);
};

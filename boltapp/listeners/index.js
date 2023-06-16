const actions = require('./actions');
const events = require('./events');
const messages = require('./messages');
const views = require('./views');

module.exports.registerListeners = (app) => {
  actions.register(app);
  events.register(app);
  messages.register(app);
  views.register(app);
};
const mongoose = require('mongoose');
const model = require('./model');
const { config } = require('../../config');

const uri = `mongodb://mongo:mongo@${config.MONGODB_HOST}/app?retryWrites=true&w=majority`;

class mongoDB {
  static async connect(logger) {
    await mongoose.connect(
      uri,
      { useNewUrlParser: true, useUnifiedTopology: true },
    );
    logger.info('DB(mongodb) is connected.');
  }

  static async getUserSettings(userId) {
    const query = { id: userId, bot: config.BOT_NAME };
    const update = {};
    const options = { new: true, upsert: true };
    const result = await model.Setting.findOneAndUpdate(query, update, options).lean();
    return result;
  }

  static async setUserSettings(userSettings) {
    const query = { id: userSettings.id, bot: userSettings.bot };
    const update = {
      bot: userSettings.bot,
      size: userSettings.size,
      min_score: userSettings.min_score,
    };
    const options = { new: false, upsert: true };
    const result = await model.Setting.findOneAndUpdate(query, update, options).lean();
    return result;
  }

  static async getHistory(query) {
    query.bot = config.BOT_NAME;
    const result = await model.History.findOne(query);
    return result;
  }

  static async setHistory(history) {
    if ('save' in history) {
      await history.save();
    } else {
      const _history = new model.History({
        bot: config.BOT_NAME,
        client_msg_id: history.client_msg_id,
        user: history.user,
        user_name: history.user_name,
        channel: history.channel,
        text: history.text,
        recommends: history.recommends,
      });
      await _history.save();
    }
  }
}

module.exports = { mongoDB };

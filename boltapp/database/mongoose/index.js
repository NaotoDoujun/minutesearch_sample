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
    await model.Setting.findOneAndUpdate(query, update, options).lean();
  }
}

module.exports = { mongoDB };

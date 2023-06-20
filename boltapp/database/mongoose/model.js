const mongoose = require('mongoose');
const { config } = require('../../config');

const settingSchema = new mongoose.Schema({
  id: { type: String },
  bot: { type: String, default: config.BOT_NAME },
  size: { type: Number, default: config.DEFAULT_SIZE },
  min_score: { type: Number, default: config.DEFAULT_MIN_SCORE },
});

exports.Setting = mongoose.model('Setting', settingSchema);

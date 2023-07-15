const mongoose = require('mongoose');
const { config } = require('../../config');

const settingSchema = new mongoose.Schema({
  id: { type: String },
  bot: { type: String, default: config.BOT_NAME },
  size: { type: Number, default: config.DEFAULT_SIZE },
  min_score: { type: Number, default: config.DEFAULT_MIN_SCORE },
});

const ratedUserSchema = new mongoose.Schema(
  {
    user: { type: String },
    user_name: { type: String },
    positive: { type: Boolean, default: false },
    negative: { type: Boolean, default: false },
    positive_comment: { type: String },
    negative_comment: { type: String } },
  { timestamps: true },
);

const recommendSchema = new mongoose.Schema(
  {
    document_id: { type: String },
    trouble_header: { type: String },
    cause_header: { type: String },
    response_header: { type: String },
    trouble: { type: String },
    cause: { type: String },
    response: { type: String },
    rated_users: [ratedUserSchema],
    rating: { type: Number },
    score: { type: Number } },
  { timestamps: true },
);

const historySchema = new mongoose.Schema(
  {
    bot: { type: String, default: config.BOT_NAME },
    client_msg_id: { type: String },
    user: { type: String },
    user_name: { type: String },
    channel: { type: String },
    text: { type: String },
    recommends: [recommendSchema] },
  { timestamps: true },
);

exports.Setting = mongoose.model('Setting', settingSchema);
exports.History = mongoose.model('History', historySchema);
exports.Recommend = mongoose.model('Recommend', recommendSchema);
exports.RatedUser = mongoose.model('RatedUser', ratedUserSchema);

const db = require('./mongoose').mongoDB;

class Database {
  static async connect(logger) {
    try {
      await db.connect();
    } catch (error) {
      logger.error(error);
    }
  }

  static async getUserSettings(userId, logger) {
    try {
      return await db.getUserSettings(userId);
    } catch (error) {
      logger.error(error);
    }
    return null;
  }

  static async setUserSettings(userSettings, logger) {
    try {
      return await db.setUserSettings(userSettings);
    } catch (error) {
      logger.error(error);
    }
    return null;
  }
}

module.exports = { Database };

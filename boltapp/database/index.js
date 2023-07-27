const db = require('./mongoose').mongoDB;

class Database {
  static async connect(logger) {
    try {
      await db.connect(logger);
    } catch (error) {
      logger.error(error);
    }
  }

  static async getUserSettings(userId, logger) {
    try {
      const result = await db.getUserSettings(userId);
      logger.debug(`${this.name}.getUserSettings()`, result);
      return result;
    } catch (error) {
      logger.error(error);
    }
    return null;
  }

  static async setUserSettings(userSettings, logger) {
    try {
      const result = await db.setUserSettings(userSettings);
      logger.debug(`${this.name}.setUserSettings()`, result);
      return result;
    } catch (error) {
      logger.error(error);
    }
    return null;
  }

  static async getHistory(query, logger) {
    try {
      const result = await db.getHistory(query);
      logger.debug(`${this.name}.getHistory()`, result);
      return result;
    } catch (error) {
      logger.error(error);
    }
    return null;
  }

  static async setHistory(history, logger) {
    try {
      await db.setHistory(history);
      logger.debug(`${this.name}.setHistory()`, history);
    } catch (error) {
      logger.error(error);
    }
  }
}

module.exports = { Database };

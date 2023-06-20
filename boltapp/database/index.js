const db = require('./mongoose').mongoDB;

class Database {
  static async connect() {
    try {
      await db.connect();
    } catch (error) {
      console.error(error);
    }
  }

  static async getUserSettings(userId) {
    try {
      return await db.getUserSettings(userId);
    } catch (error) {
      console.error(error);
    }
    return null;
  }

  static async setUserSettings(userSettings) {
    try {
      return await db.setUserSettings(userSettings);
    } catch (error) {
      console.error(error);
    }
    return null;
  }
}

module.exports = { Database };

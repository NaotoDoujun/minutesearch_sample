const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { config } = require('../../config');

let db = null;

class sqliteDB {
  static async connect(logger) {
    db = new sqlite3.Database(path.join(__dirname, 'app.sqlite'));
    await sqliteDB.run('CREATE TABLE IF NOT EXISTS settings (id TEXT, bot TEXT, size INT, min_score REAL, PRIMARY KEY(id, bot))');
    await sqliteDB.run('CREATE TABLE IF NOT EXISTS histories (channel TEXT, client_msg_id TEXT, user TEXT, bot TEXT, json JSON NOT NULL, PRIMARY KEY(channel, client_msg_id, user, bot))');
    logger.info('DB(sqlite) is connected.');
  }

  static async getUserSettings(userId) {
    let result = await sqliteDB.get('SELECT * FROM settings WHERE id = ? AND bot = ?', [userId, config.BOT_NAME]);
    if (!result) {
      const userSettings = {
        id: userId,
        bot: config.BOT_NAME,
        size: config.DEFAULT_MAX_SIZE,
        min_score: config.DEFAULT_MIN_SCORE,
      };
      result = await sqliteDB.setUserSettings(userSettings);
    }
    return result;
  }

  static async setUserSettings(userSettings) {
    userSettings.bot = config.BOT_NAME;
    const values = [userSettings.id, userSettings.bot, userSettings.size, userSettings.min_score];
    await sqliteDB.run('INSERT OR REPLACE INTO settings (id, bot, size, min_score) VALUES(?, ?, ?, ?)', values);
    const result = await sqliteDB.get('SELECT * FROM settings WHERE id = ? AND bot = ?', [userSettings.id, config.BOT_NAME]);
    return result;
  }

  static async getHistory(query) {
    query.bot = config.BOT_NAME;
    const wheres = [query.channel, query.client_msg_id, query.user, query.bot];
    const result = await sqliteDB.get('SELECT json from histories WHERE channel = ? AND client_msg_id = ? AND user = ? AND bot = ?', wheres);
    return JSON.parse(result.json);
  }

  static async setHistory(history) {
    history.bot = config.BOT_NAME;
    const values = [
      history.channel,
      history.client_msg_id,
      history.user,
      history.bot,
      JSON.stringify(sqliteDB.timestamp_history(history)),
    ];
    await sqliteDB.run('INSERT OR REPLACE INTO histories (channel, client_msg_id, user, bot, json) VALUES(?, ?, ?, ?, json(?))', values);
  }

  static get(sql, params) {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
  }

  static run(sql, params) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }

  static timestamp_history(history) {
    if ('createdAt' in history) {
      history.updatedAt = Date.now();
    } else {
      history.createdAt = Date.now();
      history.updatedAt = Date.now();
    }
    history.recommends = history.recommends.map((rc) => {
      if ('createdAt' in rc) {
        rc.updatedAt = Date.now();
      } else {
        rc.createdAt = Date.now();
        rc.updatedAt = Date.now();
      }
      rc.rated_users = rc.rated_users.map((ru) => {
        if ('createdAt' in ru) {
          ru.updatedAt = Date.now();
        } else {
          ru.createdAt = Date.now();
          ru.updatedAt = Date.now();
        }
        return ru;
      });
      return rc;
    });
    return history;
  }
}

module.exports = { sqliteDB };

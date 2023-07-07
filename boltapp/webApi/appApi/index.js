const axios = require('axios');
const { config } = require('../../config');

const apihost = config.APPAPI_HOST;

const troubleSearch = async (size, min_score, from, message) => {
  const result = await axios.post(`${apihost}/troubles_search/?size=${size}&min_score=${min_score}&from_=${from}`, { text: message.text });
  return result;
};

const troubleUserRate = async (ratingItem) => {
  const result = await axios.post(`${apihost}/trouble_user_rate/`, ratingItem);
  return result;
};

const troubleRecordComment = async (commentItem) => {
  const result = await axios.post(`${apihost}/trouble_record_comment/`, commentItem);
  return result;
}

module.exports = { troubleSearch, troubleUserRate, troubleRecordComment };

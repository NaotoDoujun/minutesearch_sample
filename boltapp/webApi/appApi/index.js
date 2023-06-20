const axios = require('axios');
const { config } = require('../../config');

const apihost = config.APPAPI_HOST;

const troubleSearch = async (size, min_score, message) => {
  const result = await axios.post(`${apihost}/troubles_search/?size=${size}&min_score=${min_score}`, { text: message.text });
  return result;
};

module.exports = { troubleSearch };

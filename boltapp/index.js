require('dotenv').config();
const { App } = require('@slack/bolt');
const axios = require('axios').default;

/* 
This sample slack application uses SocketMode
For the companion getting started setup guide, 
see: https://slack.dev/bolt-js/tutorial/getting-started 
*/

// Initializes your app with your bot token and app token
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: process.env.PORT || 3000
});

const filehost = "http://localhost";
const filedir = "sample";
const recommendSize = 10;

// Listens to incoming messages
app.message('', async ({ message, say }) => {

  await axios.post(`http://appapi:8000/minutes_search/?size=${recommendSize}`, { text: message })
    .then(async res => {
      const total = res.data.total;
      const blocks = [{
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `recommends count:${res.data.hits.length}`
        }
      }];
      for (const i in res.data.hits) {
        const recommend = res.data.hits[i];
        const file_path = `${filehost}/media/${filedir}/${recommend.filename}#page=${recommend.page}`;
        blocks.push(
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `<${file_path}|${recommend.filename}> score:[${recommend.score}]`
            }
          },
          {
            "type": "divider"
          }
        );
      }

      // say() sends a message to the channel where the event was triggered
      if (total.value > 0) {
        await say({
          blocks: blocks,
          text: `recommended minute was ${total.value}`
        });
      }

    }).catch(err => {
      console.error(err);
    });

});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
const { slackApi } = require('../../webApi');

const joinChannelsViewCallback = async ({ ack, client, view, logger }) => {
  try {
    await ack();
    const formValues = view.state.values;
    const selected_channels = formValues.join_channels.join_channels_checkboxes.selected_options;
    Object.values(selected_channels).forEach(async (channel) => {
      await slackApi.joinChannel(client, channel.value);
    });
  } catch (error) {
    logger.error(error);
  }
};

module.exports = { joinChannelsViewCallback };

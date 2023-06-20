const sampleBlocks = async (userInfo, hits) => {
  const blocks = Object.keys(hits).map((key) => {
    const recommend = hits[key];
    const trouble = recommend.trouble ? recommend.trouble : '';
    return {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: trouble,
      },
    };
  });
  return blocks;
};

module.exports = { sampleBlocks };

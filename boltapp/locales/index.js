const i18n = require('i18n');

i18n.configure({
  locales: ['en', 'ja'],
  defaultLocale: 'en',
  directory: __dirname,
});
module.exports = { i18n };

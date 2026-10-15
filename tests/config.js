const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const envName = process.env.ENV || process.env.NODE_ENV || 'stg';
const envFile = path.resolve(__dirname, `../.env.${envName}`);
require('dotenv').config({ path: envFile, override: true });

const baseURL = process.env.BASE_URL || 'https://fa-webapp-test.toyota.com.ph';
const credentials = {
  superUser: process.env.TMP_SUPERUSER || process.env.TMP_EMAIL,
  userId: process.env.TMP_USER_ID || process.env.TMP_EMAIL || 'shanehollander',
  password: process.env.TMP_PASSWORD || 'Abcd@1234',
};

module.exports = {
  baseURL,
  credentials,
};

const argv = require('minimist')(process.argv.slice(2));

const INPUT_HOST = argv.host || argv.h || '127.0.0.1';
const API_HOST = INPUT_HOST.search(/^http[s]?:\/\//) === -1 ? `http://${INPUT_HOST}` : INPUT_HOST;
const API_PORT = argv.port || argv.p || '8080';
const SERVER_PORT = process.env.PORT || 3000;
const SERVER_HOST = argv.l || 'localhost';

module.exports = {
  apiHost: API_HOST,
  apiPort: API_PORT,
  serverPort: SERVER_PORT,
  serverHost: SERVER_HOST,
  htmlTitle: 'Template',
};

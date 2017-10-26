/* eslint no-console: off */
const path = require('path');
const express = require('express');
const webpack = require('webpack');
const DashboardPlugin = require('webpack-dashboard/plugin');
const config = require('./config/webpack.config.dev');
const constants = require('./config/webpack.config.constants');

const app = express();
const compiler = webpack(config);

compiler.apply(new DashboardPlugin());

app.use('/static', express.static(path.resolve(__dirname, '/dist')));
app.use(
  require('webpack-dev-middleware')(compiler, {
    publicPath: config.output.publicPath,
    stats: {
      colors: true,
    },
  })
);

app.use(require('webpack-hot-middleware')(compiler));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, './src/index.html'));
// });
//
// In order to access index.html in memory,
// instead above code to below
app.use('*', (req, res, next) => {
  const filename = path.join(compiler.outputPath, 'index.html');
  compiler.outputFileSystem.readFile(filename, (err, result) => {
    if (err) {
      next(err);
    }

    res.set({ 'Content-Type': 'text/html' });
    res.send(result);
  });
});

app.listen(constants.serverPort, constants.serverHost, err => {
  if (err) {
    console.log(err);
    return;
  }

  console.log(
    `Listening at http://${constants.serverHost}:${constants.serverPort}`
  );
});

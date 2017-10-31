const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const eslintFormatter = require('eslint-friendly-formatter');
const postcssFlexbugsFixes = require('postcss-flexbugs-fixes');
const autoprefixer = require('autoprefixer');
const rucksackCss = require('rucksack-css');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const stylelintFormatterTable = require('stylelint-formatter-table');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const constants = require('./webpack.config.constants');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

module.exports = {
  devtool: 'cheap-module-eval-source-map',
  entry: ['webpack-hot-middleware/client', resolveApp('src/index.js')],
  output: {
    path: resolveApp('dist'),
    filename: 'static/js/bundle.js',
    publicPath: `http://${constants.serverHost}:${constants.serverPort}/`,
    pathinfo: true,
    chunkFilename: 'static/js/[name].chunk.js',
    devtoolModuleFilenameTemplate: info =>
      path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
  },
  resolve: {
    modules: [resolveApp('src'), 'node_modules'],
    extensions: ['*', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        include: /src/,
        enforce: 'pre',
        use: [
          {
            loader: require.resolve('eslint-loader'),
            options: {
              formatter: eslintFormatter,
            },
          },
        ],
      },
      {
        oneOf: [
          {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            include: /src/,
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
            },
          },
          {
            test: /\.css$/,
            loader: ExtractTextPlugin.extract({
              fallback: {
                loader: require.resolve('style-loader'),
                options: { sourceMap: true },
              },
              use: [
                {
                  loader: require.resolve('css-loader'),
                  options: {
                    importLoaders: 1,
                    sourceMap: true,
                    // modules: true,
                    // localIdentName: '[path][name]__[local]--[hash:base64:5]',
                    // minimize: true,
                  },
                },
                {
                  loader: require.resolve('postcss-loader'),
                  options: {
                    ident: 'postcss',
                    sourceMap: 'inline',
                    plugins: () => [
                      postcssFlexbugsFixes,
                      autoprefixer({
                        browsers: [
                          '>1%',
                          'last 4 versions',
                          'Firefox ESR',
                          'not ie < 9', // React doesn't support IE8 anyway
                        ],
                        flexbox: 'no-2009',
                      }),
                      rucksackCss,
                    ],
                  },
                },
              ],
            }),
          },
          {
            test: /\.(sass|scss)$/,
            use: ExtractTextPlugin.extract({
              fallback: {
                loader: require.resolve('style-loader'),
                options: { sourceMap: true },
              },
              use: [
                {
                  loader: require.resolve('css-loader'),
                  options: {
                    importLoaders: 2,
                    sourceMap: true,
                    modules: true,
                    localIdentName: '[path][name]__[local]--[hash:base64:5]',
                    // minimize: true,
                  },
                },
                {
                  loader: require.resolve('postcss-loader'),
                  options: {
                    ident: 'postcss',
                    sourceMap: 'inline',
                    plugins: () => [
                      postcssFlexbugsFixes,
                      autoprefixer({
                        browsers: [
                          '>1%',
                          'last 4 versions',
                          'Firefox ESR',
                          'not ie < 9', // React doesn't support IE8 anyway
                        ],
                        flexbox: 'no-2009',
                      }),
                      rucksackCss,
                    ],
                  },
                },
                {
                  loader: require.resolve('sass-loader'),
                  options: { sourceMap: true },
                },
              ],
            }),
          },
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            loader: require.resolve('url-loader'),
            options: {
              limit: 10000,
              name: 'static/assets/[name].[hash:8].[ext]',
            },
          },
          {
            exclude: [/\.html$/, /\.(js|jsx)$/, /\.css$/, /\.json$/],
            loader: require.resolve('file-loader'),
            options: {
              name: 'static/assets/[name].[hash:8].[ext]',
            },
          },
        ],
      },
    ],
    strictExportPresence: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
        API_HOST: JSON.stringify(constants.apiHost),
        API_PORT: JSON.stringify(constants.apiPort),
      },
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.NamedModulesPlugin(),
    new ExtractTextPlugin({
      disable: true,
      filename: 'static/css/[name].[hash:8].bundle.css',
      allChunks: true,
    }),
    new HtmlWebpackPlugin({
      inject: true,
      title: constants.htmlTitle,
      filename: 'index.html',
      template: resolveApp('config/index.template.html'),
    }),
    new StyleLintPlugin({
      configFile: '.stylelintrc.json',
      files: 'src/**/*.s?(a|c)ss',
      formatter: stylelintFormatterTable,
    }),
    new CaseSensitivePathsPlugin(),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
  ],
  externals: {
    jwplayer: 'jwplayer',
  },
};

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
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const constants = require('./webpack.config.constants');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const extractCssFilename = 'static/css/[name].[contenthash:8].bundle.css';
const outputPublicPath = './';
const shouldUseRelativeAssetPaths = outputPublicPath === './';
const extractTextPluginPublicPath = shouldUseRelativeAssetPaths
  ? Array(extractCssFilename.split('/').length).join('../')
  : outputPublicPath;

const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP === 'true';

module.exports = {
  bail: true,
  devtool: shouldUseSourceMap ? 'source-map' : false,
  entry: [resolveApp('src/index.js')],
  output: {
    path: resolveApp('dist'),
    filename: 'static/js/bundle.[chunkhash:8].js',
    publicPath: outputPublicPath,
    chunkFilename: 'static/js/[name].[chunkhash:8].chunk.js',
    devtoolModuleFilenameTemplate: info =>
      path
        .relative(resolveApp('src'), info.absoluteResourcePath)
        .replace(/\\/g, '/'),
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
              compact: true,
            },
          },
          {
            test: /\.css$/,
            loader: ExtractTextPlugin.extract({
              publicPath: extractTextPluginPublicPath,
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
                    // localIdentName: '[local]--[hash:base64:5]',
                    minimize: true,
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
              publicPath: extractTextPluginPublicPath,
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
                    localIdentName: '[local]--[hash:base64:5]',
                    minimize: true,
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
        NODE_ENV: JSON.stringify('production'),
      },
    }),
    new ExtractTextPlugin({
      disable: false,
      filename: extractCssFilename,
      allChunks: true,
    }),
    new HtmlWebpackPlugin({
      inject: true,
      title: constants.htmlTitle,
      filename: 'index.html',
      template: resolveApp('config/index.template.html'),
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
    new StyleLintPlugin({
      configFile: '.stylelintrc.json',
      files: 'src/**/*.s?(a|c)ss',
      formatter: stylelintFormatterTable,
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: {
          warnings: false,
          comparisons: false,
        },
        output: {
          comments: false,
          ascii_only: true,
        },
      },
      sourceMap: shouldUseSourceMap,
    }),
    new FaviconsWebpackPlugin({
      logo: resolveApp('src/assets/favicon.png'),
      prefix: 'static/assets/icons-[hash]/',
      emitStats: false,
      statsFilename: 'iconstats-[hash:8].json',
      persistentCache: true,
      inject: true,
      background: '#fff',
      title: '',
      icons: {
        android: true,
        appleIcon: true,
        appleStartup: true,
        coast: false,
        favicons: true,
        firefox: true,
        opengraph: false,
        twitter: false,
        yandex: false,
        windows: false,
      },
    }),
  ],
  externals: {
    jwplayer: 'jwplayer',
  },
};

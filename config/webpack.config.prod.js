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

// Reference from create-react-app:
//   Source maps are resource heavy and can cause out of memory issue for large source files.
//   預設不產出sourcemap
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP === 'true';

module.exports = {
  // Reference from create-react-app:
  //   Don't attempt to continue if there are any errors.
  bail: true,

  // 可以控制全域(包含JS與CSS)的sourcemap是否產出
  // 如果關閉(false)，JS或CSS本身有開啟產生sourcemap也沒用
  // 如果開啟(true),若JS或CSS本身沒開也不會產出sourcemap
  devtool: shouldUseSourceMap ? 'source-map' : false,
  entry: [resolveApp('src/index.js')],
  output: {
    path: resolveApp('dist'),
    filename: 'static/js/bundle.[chunkhash:8].js',
    publicPath: './',
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
              // Official URL:
              //   https://babeljs.io/docs/usage/api/
              // Description:
              //   Do not include superfluous whitespace characters and line terminators.
              //   When set to "auto" compact is set to true on input sizes of >500KB.
              //   Default is "auto".
              compact: true,
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
      filename: 'static/css/[name].[hash:8].bundle.css',
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

    // Reference from create-react-app:
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: {
          warnings: false,
          // Disabled because of an issue with Uglify breaking seemingly valid code:
          // https://github.com/facebookincubator/create-react-app/issues/2376
          // Pending further investigation:
          // https://github.com/mishoo/UglifyJS2/issues/2011
          comparisons: false,
        },
        output: {
          comments: false,
          // Turned on because emoji and regex is not minified properly using default
          // https://github.com/facebookincubator/create-react-app/issues/2488
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

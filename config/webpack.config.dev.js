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

// Reference from create-react-app:
//   https://github.com/facebookincubator/create-react-app/search?utf8=%E2%9C%93&q=appDirectory&type=
//   Make sure any symlinks in the project folder are resolved:
//   https://github.com/facebookincubator/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

module.exports = {
  // Official URL:
  //   https://webpack.js.org/configuration/devtool
  // Description:
  //   1. This option controls if and how source maps are generated.
  //      Choose a style of source mapping to enhance the debugging process.
  //      These values can affect build and rebuild speed dramatically.
  //   2. Some of these values are suited for development and some for production.
  //      For development you typically want fast Source Maps at the cost of bundle size,
  //      but for production you want separate Source Maps that are accurate and support minimizing.
  // Value:
  //   [ string | false ]
  // Other:
  //   1. The webpack repository contains an example showing the effect of all devtool variants.
  //      Those examples will likely help you to understand the differences.
  //   2. Instead of using the devtool option you can also use
  //      SourceMapDevToolPlugin/EvalSourceMapDevToolPlugin directly as it has more options.
  //      Never use both the devtool option and plugin together.
  //      The devtool option adds the plugin internally
  //      so you would end up with the plugin applied twice.
  //   3. See output.sourceMapFilename to customize the filenames of generated Source Maps.
  //   4. 如果你的modules裡面已經包含了SourceMaps，你需要用source-map-loader 來和合併生成一個新的SourceMaps
  // Ref:
  //   1. [webpack]devtool里的7種SourceMap模式是什麼鬼？
  //      http://it.uu01.me/p/gdgkd.html
  //      https://juejin.im/post/58293502a0bb9f005767ba2f
  //   2. 在开发过程中使用Sourcemap
  //      https://mrshi.gitbooks.io/survivejs_webpack_chinese/chapter3-5.html
  devtool: 'cheap-module-eval-source-map',

  // Official URL:
  //   https://webpack.js.org/configuration/entry-context/#entry
  //   https://webpack.js.org/concepts/entry-points
  // Description:
  //   1. The point or points to enter the application.
  //      At this point the application starts executing.
  //      If an array is passed all items will be executed.
  //   2. Simple rule: one entry point per HTML page.
  //      SPA: one entry point, MPA: multiple entry points.
  //   3. If a string or array of strings is passed, the chunk is named main.
  //      If an object is passed, each key is the name of a chunk,
  //      and the value describes the entrypoint for the chunk.
  // Value:
  //   [ string | [string] | object { <key>: string | [string] } | (function: () => string ]
  // Other:
  //   1. What happens when you pass an array to entry?
  //      Passing an array of file paths to the entry property creates
  //      what is known as a "multi-main entry".
  //      This is useful when you would like to inject multiple dependent files together
  //      and graph their dependencies into one "chunk".
  //   2. output.filename可以用[name]來取得entry point的chunk name
  // Ref:
  //   1. 使用多入口文件
  //      https://stephenzhao.github.io/webpack-cn/docs/multiple-entry-points.html
  //   2. 如何使用 Webpack 模組整合工具
  //      https://rhadow.github.io/2015/03/23/webpackIntro/
  //   3. 使用 webpack code splitting 整合 react-router 和 React
  //      http://jason-wang.logdown.com/posts/737515-integration-react-router-webpack-code-splitting-and-react
  entry: ['webpack-hot-middleware/client', resolveApp('src/index.js')],

  // Official URL:
  //   https://webpack.js.org/configuration/output/
  // Description:
  //   1. Contains set of options instructing webpack on how
  //      and where it should output your bundles,
  //      assets and anything else you bundle or load with webpack.
  output: {
    // Official URL:
    //   https://webpack.js.org/configuration/output/#output-path
    // Description:
    //   1. The output directory as an absolute path.
    //   2. Note that [hash] in this parameter will be replaced with an hash of the compilation.
    //      See the Caching guide for details.
    // Value:
    //   [ string ]
    path: resolveApp('dist'),

    // Official URL:
    //   https://webpack.js.org/configuration/output/#output-filename
    // Description:
    //   1. This option determines the name of each output bundle.
    //      The bundle is written to the directory specified by the output.path option.
    //   2. For a single entry point, this can be a static name.
    //      However, when creating multiple bundles via more than one entry point, code splitting,
    //      or various plugins, you should use one of the following substitutions
    //      to give each bundle a unique name.
    //        1) Using entry name([name])
    //        2) Using internal chunk id([id])
    //        3) Using the unique hash generated for every build([name].[hash])
    //        4) Using hashes based on each chunks' content([chunkhash])
    //      Make sure to read the Caching guide for details.
    //      There are more steps involved than just setting this option.
    //   3. The lengths of [hash] and [chunkhash] can be specified using [hash:16] (defaults to 20).
    //      Alternatively, specify output.hashDigestLength to configure the length globally.
    //   4. Note this option is called filename but you are still allowed to use something
    //      like "js/[name]/bundle.js" to create a folder structure.
    //   5. Note this options does not affect output files for on-demand-loaded chunks.
    //      For these files the output.chunkFilename option is used.
    //      It also doesn't affect files created by loaders.
    //      For these files see loader options.
    // Value:
    //   [ string ]
    // Other:
    //   1. When using the ExtractTextWebpackPlugin, use [contenthash]
    //      to obtain a hash of the extracted file (neither[hash] nor [chunkhash] work).
    filename: 'static/js/bundle.js',

    // Official URL:
    //   https://webpack.js.org/configuration/output/#output-publicpath
    // Description:
    //   1. This is an important option when using on-demand-loading, hosting assets on a CDN or
    //      loading external resources like images, files, etc.
    //      If an incorrect value is specified you'll receive 404 errors
    //      while loading these resources.
    //   2. This option specifies the public URL of the output directory
    //      when referenced in a browser.
    //      A relative URL is resolved relative to the HTML page (or <base> tag).
    //   3. The value of the option is prefixed to every URL created by the runtime or loaders.
    //      Because of this the value of this option ends with / in most cases.
    //   4. The default value is an empty string "".
    //   5. Simple rule: The URL of your output.path from the view of the HTML page.
    //        in server.js:
    //          app.use('/static', express.static(path.resolve(__dirname, '/dist')));
    //        in webpack.config.dev.js:
    //          path: path.resolve(__dirname, "public"),
    //          publicPath: "https://cdn.example.com/static
    //   6. For this configuration:
    //        publicPath: "/assets/",
    //        chunkFilename: "[id].chunk.js"
    //      A request to a chunk will look like /assets/4.chunk.js.
    //      A loader outputting HTML might emit something like this:
    //        <link href="/assets/spinner.gif" />
    //      or when loading an image in CSS:
    //        background-image: url(/assets/spinner.gif);
    //      The webpack- dev - server also takes a hint from publicPath,
    //      using it to determine where to serve the output files from.
    //   7. In cases where the publicPath of output files can't be known at compile time,
    //      it can be left blank and set dynamically at runtime
    //      in the entry file using the free variable __webpack_public_path__.
    // Value:
    //   [ string ]
    // Ref:
    //   1. <24 - 心法 5 - 再探設定檔> webpack 設定檔中的 Public Path
    //      https://ithelp.ithome.com.tw/articles/10187242
    //   2. Public Path(公共路径)
    //      http://www.css88.com/doc/webpack/guides/public-path/
    publicPath: `http://${constants.serverHost}:${constants.serverPort}/`,

    // Official URL:
    //   https://webpack.js.org/configuration/output/#output-pathinfo
    // Description:
    //   1. Tell webpack to include comments in bundles
    //      with information about the contained modules.
    //   2. This option defaults to false and should not be used in production,
    //      but it's very useful in development when reading the generated code.
    // Value:
    //   [ bool ]
    pathinfo: true,

    // Official URL:
    //   https://webpack.js.org/configuration/output/#output-chunkfilename
    // Description:
    //   1. This option determines the name of non-entry chunk files.
    // Value:
    //   [ string ]
    // Ref:
    //   1. 怎么理解webpack中的output.filename 和output.chunkFilename
    //      http://react-china.org/t/webpack-output-filename-output-chunkfilename/2256
    //   2. webpack中的filename 和chunkFilename
    //      http://www.jianshu.com/p/d9ebab57bca1
    //   3. webpack文件名相关配置和按需加载
    //      http://www.zkboys.com/2016/03/10/webpack%E6%96%87%E4%BB%B6%E5%90%8D/
    //   4. webpack 按需打包加载
    //      https://github.com/eyasliu/blog/issues/8
    chunkFilename: 'static/js/[name].chunk.js',

    // Official URL:
    //   https://webpack.js.org/configuration/output/#output-devtoolmodulefilenametemplate
    // Description:
    //   1. This option is only used when 'devtool' uses an options which requires module names.
    //   2. Customize the names used in each source map's sources array.
    //      This can be done by passing a template string or function
    // Value:
    //   [ string | function(info) ]
    // Other:
    //   1. 文件在Chrome開發工具中顯示為webpack:///fool.js?a93h，我們想讓它顯示成webpack://path/to/foo.js，這樣更加清晰易讀。
    //      就必須這樣設定 devtoolModuleFilenameTemplate: 'webpack:///[absolute-resource-path]'
    // Ref:
    //   1. Webpack 使用技巧
    //      http://blog.sevenplus.me/2016/12/30/webpack-trick/
    //   2. Webpack之配置说明
    //      http://stephenzhao.github.io/2016/06/13/webpack-doc-configuration/

    // Reference from create-react-app:
    //   Point sourcemap entries to original disk location (format as URL on Windows)
    devtoolModuleFilenameTemplate: info =>
      path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
  },

  // Official URL:
  //   https://webpack.js.org/configuration/resolve
  // Description:
  //   1. Configure how modules are resolved.
  //   2. For example, when calling import "lodash" in ES2015,
  //      the resolve options can change where webpack goes to look for "lodash".
  resolve: {
    // Official URL:
    //   https://webpack.js.org/configuration/resolve/#resolve-modules
    // Description:
    //   1. Tell webpack what directories should be searched when resolving modules.
    //   2. Absolute and relative paths can both be used.
    // Value:
    //   [ array ]
    modules: [resolveApp('src'), 'node_modules'],

    // Official URL:
    //   https://webpack.js.org/configuration/resolve/#resolve-extensions
    // Description:
    //   1. Automatically resolve certain extensions.
    //   2. Which is what enables users to leave off the extension when importing
    // Value:
    //   [ array ]
    // Ref:
    //   1. What does resolve.extensions do in Webpack?
    //      https://stackoverflow.com/questions/40565361/what-does-resolve-extensions-do-in-webpack
    //   2. Webpack: Error: configuration.resolve.extensions[0] should not be empty
    //      http://michelleliu.io/uncategorized/webpack-error-configuration-resolve-extensions0-should-not-be-empty
    //   3. Getting error: configuration.resolve.extensions[0] should not be empty
    //      https://github.com/webpack/webpack/issues/3043
    extensions: ['*', '.js', '.jsx'],
  },

  // Official URL:
  //   https://webpack.js.org/configuration/module
  // Description:
  //   1. These options determine how the different types
  //      of modules within a project will be treated.
  module: {
    // Official URL:
    //   https://webpack.js.org/configuration/module/#rule
    //   https://webpack.js.org/configuration/module/#condition
    //   https://webpack.js.org/configuration/#options
    // Description:
    //   1. An array of Rules which are matched to requests when modules are created.
    //      These rules can modify how the module is created.
    //      They can apply loaders to the module, or modify the parser.
    //   2. A Rule can be separated into three parts — Conditions, Results and Nested Rules.
    //   3. Conditions:
    //        1) resource( matched properties: test, include, exclude )
    //        2) issuer( matched properties: issuer)
    //      When using multiple conditions, all conditions must match.
    //   4. Results: Rule results are used only when the Rule condition matches.
    //        1) loaders: An array of loaders applied to the resource.
    //             1] these properties affect the loaders: loader, options, use.
    //             2] The enforce property affects the loader category.
    //                Whether it's a normal, pre- or post- loader.
    //        2) parser : An options object which be used to create the parser for this module.
    //   5. Nested rules: can be specified under the properties rules and oneOf.
    //      These rules are evaluated when the Rule condition matches.
    // Value:
    //   [ array ]
    // Ref:
    //   1. Webpack Modules
    //      http://www.jianshu.com/p/07b3b0adc8d4
    //   2. 浅谈webpack2--学会配置(一)
    //      http://qzhongyou.github.io/2017/09/24/%E6%B5%85%E8%B0%88webpack-%E4%B8%80/
    //   3. 写一个支持svg的loader
    //      https://xiaoiver.github.io/coding/2017/07/14/%E5%86%99%E4%B8%80%E4%B8%AA%E6%94%AF%E6%8C%81svg%E7%9A%84loader.html
    rules: [
      // Reference from create-react-app:
      //   First, run the linter.
      //   It's important to do this before Babel processes the JS.
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

      // Reference from create-react-app:
      //   "oneOf" will traverse all following loaders until one will
      //   match the requirements. When no loader matches it will fall
      //   back to the "file" loader at the end of the loader list.
      {
        oneOf: [
          {
            // Description:
            //   1. Rule.test is a shortcut to Rule.resource.test.
            //   2. If you supply a Rule.test option, you cannot also supply a Rule.resource.
            //   3. The Condition must match.
            //   4. The convention is to provide a RegExp or array of RegExps here,
            //      but it's not enforced.
            test: /\.(js|jsx)$/,

            // Description:
            //   1. Rule.exclude is a shortcut to Rule.resource.exclude.
            //   2. If you supply a Rule.exclude option, you cannot also supply a Rule.resource.
            //   3. The Condition must NOT match.
            //   4. The convention is to provide a RegExp or array of RegExps here,
            //      but it's not enforced.
            exclude: /node_modules/,

            // Description:
            //   1. Rule.exclude is a shortcut to Rule.include.exclude.
            //   2. If you supply a Rule.include option, you cannot also supply a Rule.resource.
            //   3. The Condition must match.
            //   4. The convention is to provide a RegExp or array of RegExps here,
            //      but it's not enforced.
            include: /src/,

            // Description:
            //   1. Rule.loader is a shortcut to Rule.use: [ { loader } ]
            loader: 'babel-loader',

            // Description:
            //   1. Rule.options is a shortcuts to Rule.use: [ { options } ]
            options: {
              // Reference from create-react-app:
              //   This is a feature of `babel-loader` for webpack (not Babel itself).
              //   It enables caching results in ./node_modules/.cache/babel-loader/
              //   directory for faster rebuilds.
              cacheDirectory: true,
            },
          },

          // Reference from create-react-app:
          //   "postcss" loader applies autoprefixer to our CSS.
          //   "css" loader resolves paths in CSS and adds assets as dependencies.
          //   "style" loader turns CSS into JS modules that inject <style> tags.
          //   In production, we use a plugin to extract that CSS to a file, but
          //   in development "style" loader enables hot editing of CSS.

          // without ExtractTextPlugin version
          // {
          //   test: /\.css$/,
          //   use: [
          //     { loader: require.resolve('style-loader'), },
          //     {
          //       loader: require.resolve('css-loader'),
          //       options: {
          //         importLoaders: 1,
          //         sourceMap: true,
          //         // modules: true,
          //         // localIdentName: '[path][name]__[local]--[hash:base64:5]',
          //         // minimize: true,
          //       },
          //     },
          //     {
          //       loader: 'postcss-loader',
          //       options: {
          //         ident: 'postcss', // https://webpack.js.org/guides/migrating/#complex-options
          //         sourceMap: 'inline',
          //         plugins: () => [
          //           postcssFlexbugsFixes,
          //           autoprefixer({
          //             browsers: [
          //               '>1%',
          //               'last 4 versions',
          //               'Firefox ESR',
          //               'not ie < 9', // React doesn't support IE8 anyway
          //             ],
          //             flexbox: 'no-2009',
          //           }),
          //           rucksackCss,
          //         ],
          //       },
          //     },
          //   ],
          // },
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
                    // Necessary for external CSS imports to work
                    // https://github.com/facebookincubator/create-react-app/issues/2677
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
                    // Necessary for external CSS imports to work
                    // https://github.com/facebookincubator/create-react-app/issues/2677
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

          // Reference from create-react-app:
          //   "url" loader works like "file" loader except that it embeds assets
          //   smaller than specified limit in bytes as data URLs to avoid requests.
          //   A missing `test` is equivalent to a match.
          //   If the file is greater than the limit (in bytes) the file-loader is used by default
          //   and all query parameters are passed to it.
          //   You can use other loader using fallback option.
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            loader: require.resolve('url-loader'),
            options: {
              limit: 10000,
              name: 'static/assets/[name].[hash:8].[ext]',
            },
          },

          // Reference from create-react-app:
          //   "file" loader makes sure those assets get served by WebpackDevServer.
          //   When you `import` an asset, you get its (virtual) filename.
          //   In production, they would get copied to the `build` folder.
          //   This loader doesn't use a "test" so it will catch all modules
          //   that fall through the other loaders.
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

    // Official URL:
    //   https://webpack.js.org/configuration/module/#module-contexts
    // Description:
    //   1. makes missing exports an error instead of warning
    // Value:
    //   [ bool ]
    strictExportPresence: true,
  },

  // Official URL:
  //   https://webpack.js.org/configuration/plugins
  //   https://webpack.js.org/plugins/
  // Description:
  //   1. The plugins option is used to customize the webpack build process in a variety of ways.
  //       Webpack comes with a variety built-in plugins available under webpack.[plugin-name].
  //       See this page for a list of plugins and documentation
  //   2. But note that there are a lot more out in the community.
  // Value:
  //   [ array ]
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

    // Reference from create-react-app:
    //   Watcher doesn't work well if you mistype casing in a path so we use
    //   a plugin that prints an error when you attempt to do this.
    //   See https://github.com/facebookincubator/create-react-app/issues/240
    new CaseSensitivePathsPlugin(),

    // Reference from create-react-app:
    //   Moment.js is an extremely popular library that bundles large locale files
    //   by default due to how Webpack interprets its code. This is a practical
    //   solution that requires the user to opt into importing specific locales.
    //   https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
    //   You can remove this if you don't use Moment.js:
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
  ],

  // Official URL:
  //   https://webpack.js.org/configuration/externals/#externals
  // Description:
  //   1. Prevent bundling of certain imported packages
  //      and instead retrieve these external dependencies at runtime.
  //   2. For example, to include jQuery from a CDN instead of bundling it.
  //   3. The bundle with external dependencies can be used in various module contexts,
  //      such as CommonJS, AMD, global and ES2015 modules.
  //      Externals accepts various syntax and interprets them in different manners.
  // Value:
  //   [ string | array | object | function | regex ]
  // Other:
  //   1. externals等於是告訴webpack說我們會自行載入外部的程式庫
  // Ref:
  //   1. <26 - 心法 6 - 再探設定檔> webpack 設定檔中的 externals
  //      https://ithelp.ithome.com.tw/articles/10187554
  //   2. webpack中library和libraryTarget与externals的使用
  //      https://github.com/zhengweikeng/blog/issues/10
  //   3. 使用 webpack 打包成可獨立引用的 js library
  //      http://humanhighway.logdown.com/posts/233700-use-webpack-pack-standalone-js-library
  //   4. webpack externals详解
  //      http://www.tangshuang.net/3343.html
  //   5. webpack中的externals vs libraryTarget vs library
  //      http://blog.csdn.net/liangklfang/article/details/54970899
  //   6. 快速入门webpack（3）- 常用配置拆分
  //      http://www.imooc.com/article/10969
  externals: {
    jwplayer: 'jwplayer',
  },
};

// Note:
// 1. json-loader is not required anymore
//   When no loader has been configured for a JSON file,
//   webpack will automatically try to load the JSON file with the json-loader.
// 2. entry and output ref
//    https://segmentfault.com/a/1190000005089993

// Other ref:
//   1. 那些在使用webpack时踩过的坑
//      http://mobilesite.github.io/2017/02/18/all-the-errors-encountered-in-webpack/
//   2. Webpack中的静态资源文件指纹(hash/chunkhash/contenthash)
//      https://juejin.im/entry/59cf5e3d6fb9a00a627161df
//   3. Webpack 2 升级指南和特性
//      https://github.com/waltcow/blog/issues/13
//   4. webpack-react-hmr-examples
//      https://github.com/jugend/webpack-react-hmr-examples
//   5. 【翻译】Webpack——令人困惑的地方
//      https://github.com/chemdemo/chemdemo.github.io/issues/13

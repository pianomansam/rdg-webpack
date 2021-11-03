const fs = require('fs');
const path = require('path');
const glob = require('glob');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const LiveReloadPlugin = require('webpack-livereload-plugin');
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

const isProduction = process.env.NODE_ENV !== 'development';

const rdgWebpackLocation = path.resolve(__dirname, 'node_modules');

const sassEntry = (entry) => ({
  entry,
  output: {
    path: path.dirname(entry).replace('src', 'dist'),
  },
  devtool: isProduction ? false : 'inline-source-map',
  resolveLoader: {
    modules: ['node_modules', rdgWebpackLocation],
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: './',
            },
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: !isProduction,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: !isProduction,
              postcssOptions: {
                plugins: {
                  autoprefixer: {},
                },
              },
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: !isProduction,
            },
          },
        ],
      },
      {
        test: /\.(ttf|eot|woff|woff2)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]'
        }
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name][ext]'
        }
      }
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: path.basename(entry).replace('scss', 'css'),
    }),
    ...(entry.search('/themes/') > -1 && entry.search('/styles.scss')
      ? [new LiveReloadPlugin({ useSourceSize: true })]
      : []),
    new ImageMinimizerPlugin({
      minimizerOptions: {
        // Lossless optimization with custom option
        // Feel free to experiment with options for better result for you
        plugins: [
          ["gifsicle", { interlaced: true }],
          ["jpegtran", { progressive: true }],
          ["optipng", { optimizationLevel: 5 }],
        ],
      },
    }),
  ],
});

const jsEntry = (entry) => ({
  entry,
  output: {
    filename: path.basename(entry),
    path: path.dirname(entry).replace('src', 'dist'),
  },
  devtool: isProduction ? false : 'inline-source-map',
  resolveLoader: {
    modules: ['node_modules', rdgWebpackLocation],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: [
              '@babel/plugin-syntax-dynamic-import',
              '@babel/plugin-proposal-class-properties',
            ],
          },
        },
      },
    ],
  },
  plugins: [],
});

module.exports = () => {
  const themeSassFiles = glob.sync('themes/custom/*/libraries/*/src/*.scss', {
    absolute: true,
  });

  const themeSassExports = themeSassFiles.map(sassEntry);

  const moduleSassFiles = glob.sync('modules/custom/*/libraries/*/src/*.scss', {
    absolute: true,
  });

  const moduleSassExports = moduleSassFiles.map(sassEntry);

  const themeJsFiles = glob.sync('themes/custom/*/libraries/*/src/*.js', {
    absolute: true,
  });

  const themeJsExports = themeJsFiles.map(jsEntry);

  const moduleJsFiles = glob.sync('modules/custom/*/libraries/*/src/*.js', {
    absolute: true,
  });

  const moduleJsExports = moduleJsFiles.map(jsEntry);

  let localConfig;

  // Import local webpack config, if it exists.
  if (fs.existsSync(process.cwd() + '/webpack.config.js')) {
    console.log('loading local webpack config');
    localConfigFile = require(process.cwd() + '/webpack.config.js');
    console.log('localConfigFile', localConfigFile);
    localConfig = localConfigFile instanceof Array ? localConfigFile : [localConfigFile];
  }

  return [
    ...themeSassExports,
    ...moduleSassExports,
    ...themeJsExports,
    ...moduleJsExports,
    ...(localConfig ? localConfig : []),
  ];
};

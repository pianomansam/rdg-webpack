const path = require('path');
const glob = require('glob');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const LiveReloadPlugin = require('webpack-livereload-plugin');

const isProduction = process.env.NODE_ENV !== 'development';

const sassEntry = (entry) => ({
  entry,
  output: {
    path: path.dirname(entry).replace('src', 'dist'),
  },
  devtool: isProduction ? false : 'inline-source-map',
  resolveLoader: {
    modules: ['node_modules', path.resolve(__dirname, 'node_modules')],
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
        test: /\.(ttf|eot|woff|woff2|svg)$/,
        exclude: `${path.dirname(entry)}/images`,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'fonts/',
          },
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        include: `${path.dirname(entry)}/images`,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'images/',
            },
          },
          {
            loader: 'image-webpack-loader',
            options: {
              disable: !isProduction,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: path.basename(entry).replace('scss', 'css'),
    }),
    ...(entry.search('/themes/') > -1 && entry.search('/styles.scss')
      ? [new LiveReloadPlugin()]
      : []),
  ],
});

const jsEntry = (entry) => ({
  entry,
  output: {
    filename: path.basename(entry),
    path: path.dirname(entry).replace('src', 'dist'),
  },
  devtool: isProduction ? false : 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: [['@babel/preset-env', { modules: false }]],
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

  return [
    ...themeSassExports,
    ...moduleSassExports,
    ...themeJsExports,
    ...moduleJsExports,
  ];
};

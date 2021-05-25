const path = require('path');

const isProduction = process.env.NODE_ENV !== 'development';

const reactEntry = (entry) => ({
  entry,
  output: {
    filename: path.basename(entry),
    path: path.dirname(entry).replace('src', 'dist'),
  },
  devtool: isProduction ? false : 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
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
});

module.exports = {
  reactEntry,
  isProduction,
};
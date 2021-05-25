const path = require('path');

const isProduction = process.env.NODE_ENV !== 'development';

const reactEntry = (entryPath) => ({
  entry: path.resolve(process.cwd(), `${entryPath}/src/index.js`),
  output: {
    filename: 'main.js',
    path: path.resolve(process.cwd(), `${entryPath}/dist`),
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
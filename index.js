const path = require('path');

const isProduction = process.env.NODE_ENV !== 'development';

/*
Note that in order to use reactEntry, you need to install the following
in the root Drupal project:
  - @babel/plugin-proposal-class-properties
  - @babel/plugin-syntax-dynamic-import
  - @babel/preset-env
  - @babel/preset-react
  - react
  - react-dom
*/
const reactEntry = (entry) => {
  const resolvedEntry = path.resolve(entry);
  return {
    entry,
    output: {
      filename: path.basename(resolvedEntry),
      path: path.dirname(resolvedEntry).replace('src', 'dist'),
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
  };
};

module.exports = {
  reactEntry,
  isProduction,
};
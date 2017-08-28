const path = require('path');

module.exports = (env = {}) => ({
  entry: './index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devtool: env.production ? 'cheap-module-source-map' : 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: ['env'],
            plugins: ['babel-plugin-transform-object-rest-spread'],
          },
        },
      },
    ],
  },
});

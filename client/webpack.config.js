const path = require('path');
const webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const config = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, './public'),
    filename: 'build.js'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.sass$/,
        use: [
          'vue-style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              indentedSyntax: true
            }
          }
        ]
      },
      {
        test: /\.css$/,
        loader: 'css-loader'
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.pug$/,
        loader: 'pug-plain-loader'
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        pathRewrite: {
          '^/api': ''
        }
      }
    },
    historyApiFallback: true,
    port: 8090
  },
  plugins: [
    new VueLoaderPlugin(),
    new CopyWebpackPlugin([
      {
        from: './node_modules/leaflet/dist/leaflet.css',
        to: 'vendor'
      },
      {
        from: './node_modules/bulma/css/bulma.min.css',
        to: 'vendor'
      }
    ])
  ]
};

module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    config.devtool = 'inline-source-map'
  }
  return config
};

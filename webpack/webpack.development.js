require('babel-core/register');

var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
var url = require('url');
var assetsPath = path.resolve(__dirname, '../assets/dist');
var ForceCaseSensitivityPlugin = require('force-case-sensitivity-webpack-plugin');
var host = (process.env.HOST || 'localhost');
var port;
if (host == 'localhost') {
  port = parseInt(process.env.PORT) + 1 || 3001;
} else {
  port = 80;
}
var publicPath = url.format({
  hostname: host,
  port: port,
  pathname: (process.env.PUBLISH_PATH || '') + '/'
});

// https://github.com/halt-hammerzeit/webpack-isomorphic-tools
var WebpackIsomorphicToolsPlugin = require('webpack-isomorphic-tools/plugin');
var webpackIsomorphicToolsPlugin = new WebpackIsomorphicToolsPlugin(require('./webpack-isomorphic-tools'));

var babelrc = fs.readFileSync(path.resolve(__dirname, '../.babelrc'));
var babelrcObject = {};

try {
  babelrcObject = JSON.parse(babelrc);
} catch (err) {
  console.error('==>     ERROR: Error parsing your .babelrc.');
  console.error(err);
}

var babelrcObjectDevelopment = babelrcObject.env && babelrcObject.env.development || {};

// merge global and dev-only plugins
var combinedPlugins = babelrcObject.plugins || [];
combinedPlugins = combinedPlugins.concat(babelrcObjectDevelopment.plugins);

var babelLoaderQuery = Object.assign({}, babelrcObjectDevelopment, babelrcObject, {
  plugins: combinedPlugins
});
delete babelLoaderQuery.env;

// Since we use .babelrc for client and server, and we don't want HMR enabled on the server, we have to add
// the babel plugin react-transform-hmr manually here.

// make sure react-transform is enabled
babelLoaderQuery.plugins = babelLoaderQuery.plugins || [];
var reactTransform = null;
for (var i = 0; i < babelLoaderQuery.plugins.length; ++i) {
  var plugin = babelLoaderQuery.plugins[i];
  if (Array.isArray(plugin) && plugin[0] === 'react-transform') {
    reactTransform = plugin;
  }
}

if (!reactTransform) {
  reactTransform = ['react-transform', {
    transforms: []
  }];
  babelLoaderQuery.plugins.push(reactTransform);
}

if (!reactTransform[1] || !reactTransform[1].transforms) {
  reactTransform[1] = Object.assign({}, reactTransform[1], {
    transforms: []
  });
}

// make sure react-transform-hmr is enabled
reactTransform[1].transforms.push({
  transform: 'react-transform-hmr',
  imports: ['react'],
  locals: ['module']
});


var config = {
  debug: true,
  devtool: 'eval-source-map',
  context: path.resolve(__dirname, '..'),
  entry: {
    commons: [
      'react',
      'react-dom'
    ]
  },
  output: {
    path: assetsPath,
    filename: '[name].js',
    chunkFilename: '[name]-[chunkhash].js',
    publicPath: publicPath
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loaders: ['babel?' + JSON.stringify(babelLoaderQuery)]
    }, {
      test: /\.json$/,
      loader: 'json'
    }, {
      test: /\.css$/,
      loader: 'style!css!postcss'
    }, {
      test: /\.less$/,
      loader: 'style!css!postcss!less?outputStyle=expanded&sourceMap'
    }, {
      test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
      loader: "url?limit=10000&mimetype=application/font-woff"
    }, {
      test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
      loader: "url?limit=10000&mimetype=application/font-woff"
    }, {
      test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
      loader: "url?limit=10000&mimetype=application/octet-stream"
    }, {
      test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
      loader: "file"
    }, {
      test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
      loader: "url?limit=10000&mimetype=image/svg+xml"
    }, {
      test: webpackIsomorphicToolsPlugin.regular_expression('images'),
      loader: 'url-loader?limit=10240'
    }],
    noParse: []
  },
  progress: true,
  resolve: {
    alias: {}
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'commons',
      filename: "commons.js",
      minChunks: Infinity
    }),
    new webpack.NoErrorsPlugin(),
    new ForceCaseSensitivityPlugin(),
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("development")
      },
      __CLIENT__: true,
      __SERVER__: false,
      __DEVELOPMENT__: true,
      __DEVTOOLS__: true  // <-------- DISABLE redux-devtools HERE
    }),
    new webpack.HotModuleReplacementPlugin(),
    webpackIsomorphicToolsPlugin.development()
  ],
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    dns: 'empty'
  }
};


module.exports = config;

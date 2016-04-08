// require('babel-core/register');
var Express = require('express');
var webpack = require('webpack');
var glob = require('glob');
var path = require('path');
var _ = require('lodash');

var webpackConfig = require('./webpack.development');
var hostWebpack = process.env.HOST || 'localhost';
var portWebpack = (parseInt(process.env.PORT) + 1) || 3001;
var hotMiddlewareScript = 'webpack-hot-middleware/client?path=http://' + hostWebpack + ':' + portWebpack + '/__webpack_hmr';

// 添加entries
var entries = {};
var entriesFile = glob.sync(path.resolve(__dirname, '../assets/src/**/*.entry.js'));
for (var i = 0, len = entriesFile.length; i < len; i++) {
  var filePath = entriesFile[i];
  var key = filePath.substring(filePath.lastIndexOf('/') + 1,filePath.lastIndexOf('.'));
  if (hostWebpack == 'localhost') {
    entries[key] = [hotMiddlewareScript, path.resolve(__dirname,filePath)];
  } else {
    entries[key] = [path.resolve(__dirname,filePath)];
  }
}
// 将entry合并到webpack中
_.merge(webpackConfig.entry, entries);
var compiler = webpack(webpackConfig);

var serverOptions = {
  contentBase: 'http://' + hostWebpack + ':' + portWebpack,
  quiet: true,
  noInfo: true,
  hot: true,
  publicPath: webpackConfig.output.publicPath,
  headers: {'Access-Control-Allow-Origin': '*'},
  stats: {colors: true}
};

var app = new Express();

app.use(require('webpack-dev-middleware')(compiler, serverOptions));
app.use(require('webpack-hot-middleware')(compiler));

app.listen(portWebpack, function onAppListening(err) {
  if (err) {
    console.error(err);
  } else {
    console.info('==> 🚧  Webpack development server listening on port %s', portWebpack);
  }
});

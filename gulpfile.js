var gulp = require('gulp');
var clean = require('gulp-clean');
var gutil = require('gulp-util');
var fs = require('fs');
var glob = require('glob');
var path = require('path');
var _ = require('lodash');
var webpack = require('webpack');
var webpackConfig = require('./webpack/webpack.production');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var libjs = [
	'<script src="http://cdn.staticfile.org/react/0.14.3/react.min.js"></script>',
	'<script src="http://cdn.staticfile.org/react/0.14.3/react-dom.min.js"></script>'
];
//清除数据
gulp.task('clean', function () {
	return gulp.src(['assets/dist/*', 'assets/assets-map.json'], {read: false})
		.pipe(clean())
});

function modifyTemplate(filename) {
	var html = fs.readFileSync(filename, 'utf-8');
	var script = libjs.join('');
	return html.replace('</body>', script + '</body>');
}

gulp.task('default', function () {
	var entries = {};

	var entryFiles = glob.sync('assets/src/**/*.entry.js');

	for (var i = 0; i < entryFiles.length; i++) {
		var filePath = entryFiles[i];
		var key = filePath.substring(filePath.lastIndexOf(path.sep) + 1, filePath.lastIndexOf('.'));
		entries[key] = path.join(__dirname, filePath);
	}

	var config = _.merge({}, webpackConfig);
	config.entry = _.merge({}, config.entry, entries);

	config.plugins = config.plugins || [];

	for (var i in entries) {
		//TODO 读取html,进行修改
		var relativePath = path.relative(__dirname, entries[i]);
		var htmlFilename = (relativePath + '.ejs').replace('.entry.js', '');
		config.plugins.push(new HtmlWebpackPlugin({
			filename: (i + '.ejs').replace('entry.', ''),
			templateContent: modifyTemplate(htmlFilename),
			inject: true,
			chunks: [i]
		}));
	}

	webpack(config, function (err, stats) {
		if (err) {
			throw new gutil.PluginError('webpack-build', err);
		}
		console.log(stats.toString({
			timings: true,
			color: true
		}));
	});
});

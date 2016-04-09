var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CleanPlugin = require('clean-webpack-plugin');
var ForceCaseSensitivityPlugin = require('force-case-sensitivity-webpack-plugin');
var assetsPath = path.resolve(__dirname, '../assets/dist');
// https://github.com/halt-hammerzeit/webpack-isomorphic-tools
var WebpackIsomorphicToolsPlugin = require('webpack-isomorphic-tools/plugin');
var webpackIsomorphicToolsPlugin = new WebpackIsomorphicToolsPlugin(require('./webpack-isomorphic-tools'));

var config = {
	context: path.resolve(__dirname),
	entry: {
		// commons: [
    //   'react',
    //   'react-dom'
    // ]
	},
	output: {
		filename: '[name]-[hash:6].js',
		chunkFilename: '[name]-[chunkhash:6].js',
		path: assetsPath,
		publicPath: '/static/'
	},
	module: {
		loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel',
			query: {
				presets: [
					'react',
					'es2015',
          'stage-0'
				]
			}
    }, {
      test: /\.json$/,
      loader: 'json'
    }, {
      test: /\.css$/,
      loader: ExtractTextPlugin.extract('style', 'css!postcss')
    }, {
      test: /\.less$/,
      loader: ExtractTextPlugin.extract('style', 'css!postcss!less')
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
      test: /\.(jpeg|jpg|png|gif)$/,
      loader: 'url-loader?limit=10240'
    }],
		noParse:[
			'react',
			'react-dom'
		]
	},
	resolve:{
		extensions: ['', '.js'],
		alias:{}
	},
	externals: {
		'react': 'React',
		'react-dom': 'ReactDOM'
	},
	plugins: [
		// new CleanPlugin([assetsPath], { root: path.resolve(__dirname, '..') }),
		new webpack.ProvidePlugin({
	    React: "React",
			react: "React",
			"window.react": "React",
			"window.React": "React",
	    ReactDOM: "ReactDOM",
			"window.ReactDOM": "ReactDOM"
		}),
		new ForceCaseSensitivityPlugin(),
		new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      },
      __CLIENT__: true,
      __SERVER__: false,
      __DEVELOPMENT__: false,
      __DEVTOOLS__: false
    }),
		new ExtractTextPlugin("[name]-[chunkhash:6].css", {allChunks: true}),

    // ignore dev config
    new webpack.IgnorePlugin(/\.\/dev/, /\/config$/, /react/),
		// new webpack.optimize.CommonsChunkPlugin({
    //   name: 'commons',
    //   filename: "[name]-[hash:6].js",
    //   minChunks: Infinity
    // }),
    // optimizations
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        drop_debugger: true,
        drop_console: true,
        warnings: false
      }
    }),
    webpackIsomorphicToolsPlugin
	]
};


module.exports = config;

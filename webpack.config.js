const webpack = require('webpack');
const path = require('path');

const config = {
	entry: [
		'./client/index.ts'
	],
	output: {
		path: path.resolve(__dirname, 'static/js'),
		filename: 'app.js'
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				use: 'babel-loader',
				exclude: /node_modules/
			},
			{
				test: /\.ts(x)?$/,
				loader: 'ts-loader',
				exclude: /node_modules/
			}
		]
	},
	resolve: {
		extensions: [
			'.tsx',
			'.ts',
			'.js'
		],
	}
};

module.exports = config;

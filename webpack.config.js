const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const config = {
	entry: [
		'./client/index.tsx'
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
			},
			{
				test: /\.css$/i,
				use: ["style-loader", "css-loader"],
			}
		]
	},
	plugins:[
		new CopyWebpackPlugin({
			patterns:[
				
				path.resolve(__dirname, "node_modules/three/examples/js/libs/draco/"),
			]
		})
	],
	resolve: {
		extensions: [
			'.tsx',
			'.ts',
			'.js'
		],
	}
};

module.exports = config;

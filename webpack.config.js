const path=require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin}=require('clean-webpack-plugin');
const webpack=require('webpack');
const configs={
	mode:'development',
	devtool:'cheap-module-eval-source-map',
	entry:{
		advertise_loop:'./src/js/index.js'
	},
	output:{
		filename:'js/[name].js',
		path:path.resolve(__dirname,'./dist'),
		chunkFilename:'js/chunk_[name]'
	},
	externals:{
		'jquery':'jQuery'
	},
	devServer:{
		contentBase:path.resolve(__dirname,'./dist'),
		port:8868
	},
	module:{
		rules:[{
			test:/\.js$/,
			exclude:[/node_modules/,path.resolve(__dirname,'./src/assets')],
			loader:'babel-loader',
			options:{
				 presets:[
					 [
					 '@babel/preset-env',{
						 useBuiltIns:'usage',
						 corejs:2
					 }
					]
				]
			}
		},{
			test:/\.(jpg|png|gif)$/i,
			use:{
				loader:'file-loader',
				options:{
					name:'[name].[ext]',
					outputPath:'images/'
				}
			}
		},{
			test: /\.(eot|ttf|svg|woff)$/,
			use: {
				loader: 'file-loader',
				options: {
					name: '[name].[ext]',
					outputPath: 'images/'
				}
			}
		},{
			test:/\.css$/,
			use:['style-loader','css-loader']
		},{
			test:/\.less$/,
			use:[{
				loader:'style-loader'
			},{
				loader:'css-loader'
			},{
				loader:'less-loader'
			}]
		}]
	},
	plugins: [
		new CleanWebpackPlugin({
			cleanOnceBeforeBuildPatterns:[
				path.resolve(__dirname,'./dist')
			]
		}),
		new webpack.ProvidePlugin({
			$:'jquery'
		})
	]
};
const makeChunks=(configs)=>{
	let chunks=[];
	Object.keys(configs.entry).forEach(key=>{
		chunks.push(key);
	});
	configs.plugins.push(new HtmlWebpackPlugin({
		template: './src/index.html',
		filename: 'index.html',
		chunks
	}));
	return configs;
}
module.exports=makeChunks(configs);

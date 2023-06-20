import type { ModuleOptions } from "webpack";

export const rules: Required<ModuleOptions>["rules"] = [
	{
		test: /\.html$/i,
		use: "raw-loader",
	},
	{
		test: /.+\.node$/,
		loader: "node-loader",
		options: {
			name: "[name].[ext]",
		},
	},
	{
		test: /\.(node)$/,
		parser: { amd: false },
		use: {
			loader: "@vercel/webpack-asset-relocator-loader",
			options: {
				outputAssetBase: "native_modules",
				emitDirnameAll: true,
			},
		},
	},
	{
		test: /\.tsx?$/,
		exclude: /(node_modules|\.webpack)/,
		use: {
			loader: "ts-loader",
			options: {
				transpileOnly: true,
			},
		},
	},
	{
		test: /\.(png|jpe?g|gif|ico)$/i,
		use: [
			{
				loader: "file-loader",
			},
		],
	},
	{
		test: /\.svg$/,
		loader: "svg-url-loader",
	},
];

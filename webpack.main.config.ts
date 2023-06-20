import type { Configuration } from "webpack";
import { isDev } from "./src/utils";
import { rules } from "./webpack.rules";
import { plugins } from "./webpack.plugins";

export const mainConfig: Configuration = {
	entry: "./src/index.ts",
	target: "electron-main",
	module: {
		rules,
	},
	output: {
		filename: "[name].js",
	},
	resolve: {
		extensions: [".js", ".ts", ".jsx", ".tsx", ".css", ".json"],
	},
	plugins,
	externals: isDev
		? []
		: [
				function ({ context, request }, callback) {
					if (request === "lumi-control") {
						return callback(null, "commonjs " + request);
					}
					callback();
				},
		  ],
	node: isDev
		? {
				__dirname: true,
				__filename: false,
		  }
		: {},
};

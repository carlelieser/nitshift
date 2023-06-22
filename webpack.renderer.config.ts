import type { Configuration } from "webpack";
import { isDev } from "./src/common/utils";
import { rules } from "./webpack.rules";
import { plugins } from "./webpack.plugins";

rules.push({
	test: /\.css$/,
	use: [{ loader: "style-loader" }, { loader: "css-loader" }],
});

export const rendererConfig: Configuration = {
	module: {
		rules,
	},
	output: {
		devtoolModuleFilenameTemplate: "[absolute-resource-path]",
	},
	target: "electron-renderer",
	plugins,
	resolve: {
		extensions: [".js", ".ts", ".jsx", ".tsx", ".css"],
	},
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

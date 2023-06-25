import { BytenodeWebpackPlugin } from "@herberttn/bytenode-webpack-plugin";
import { isDev } from "./src/common/utils";

export const plugins = isDev
	? []
	: [
			new BytenodeWebpackPlugin({
				exclude: [/\.worker/],
				compileForElectron: true,
				keepSource: false,
				preventSourceMaps: true,
			}),
	  ];

import { BytenodeWebpackPlugin } from "@herberttn/bytenode-webpack-plugin";

export const plugins =
	process.env.NODE_ENV === "development"
		? []
		: [
				new BytenodeWebpackPlugin({
					compileForElectron: true,
				}),
		  ];

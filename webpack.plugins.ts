import {BytenodeWebpackPlugin} from "@herberttn/bytenode-webpack-plugin";

export const plugins =
    process.env.NODE_ENV === "development"
        ? []
        : [
            new BytenodeWebpackPlugin({
                exclude: [/\.worker/],
                compileForElectron: true,
                keepSource: false,
                preventSourceMaps: true
            }),
        ];

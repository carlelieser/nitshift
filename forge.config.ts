import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { WebpackPlugin } from "@electron-forge/plugin-webpack";

import { mainConfig } from "./webpack.main.config";
import { rendererConfig } from "./webpack.renderer.config";
import { isDev } from "./src/utils";
import * as path from "path";

const config: ForgeConfig = {
	packagerConfig: isDev
		? {}
		: {
				ignore: [
					/\\.gitignore/,
					/node_modules\/\\.cache/,
					/.*\\.(iobj|pdb|ipdb)$/,
					/src/,
					/\.idea/,
					/\.eslintrc/,
					/\.gitignore/,
					/\.prettierrc/,
					/forge\.config/,
					/package\.json/,
					/tsconfig/,
					/webpack\.main\.config/,
					/webpack\.plugins/,
					/webpack\.renderer/,
					/webpack\.rules/,
				],
				derefSymlinks: true,
				icon: "./src/assets/img/icon.ico",
		  },
	rebuildConfig: {},
	makers: [
		new MakerSquirrel({
			authors: "Glimmr",
			exe: "Glimmr.exe",
			iconUrl:
				"https://raw.githubusercontent.com/carlelieser/glimmr/v0.0.1-beta/src/assets/img/icon.ico?token=GHSAT0AAAAAACDU7EKXI2LSVFAJBYRHAEDYZETQHIA",
			setupIcon: path.join(__dirname, "src", "assets", "img", "icon.ico"),
			loadingGif: path.join(__dirname, "src", "assets", "img", "installer.gif"),
		}),
	],
	plugins: [
		new WebpackPlugin({
			mainConfig,
			renderer: {
				config: rendererConfig,
				entryPoints: [
					{
						html: "./src/index.html",
						js: "./src/renderer.tsx",
						name: "main_window",
					},
				],
			},
		}),
	],
};

export default config;

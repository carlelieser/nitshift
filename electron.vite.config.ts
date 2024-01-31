import { bytecodePlugin, defineConfig, externalizeDepsPlugin, splitVendorChunkPlugin } from "electron-vite";
import tsconfigPaths from "vite-tsconfig-paths";
import renderer from "vite-plugin-electron-renderer";
import react from "@vitejs/plugin-react";
import dynamicImport from "vite-plugin-dynamic-import";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import path from "node:path";
import * as keys from "./src/main/keys";
import { flatten } from "flat";
import _ from "lodash";
import { obfuscator } from "rollup-obfuscator";
import { safe } from "./src/main/safe";

const deps = ["lumi-control", "firebase", "stripe", "nodemailer", "regedit"];

export default defineConfig({
	main: {
		plugins: [
			tsconfigPaths(),
			externalizeDepsPlugin({
				include: deps,
				exclude: ["p-queue"],
			}),
			bytecodePlugin({
				transformArrowFunctions: true,
				protectedStrings: [...Object.values(flatten(_.omit(keys, "price"))), safe],
			}),
		],
	},
	renderer: {
		plugins: [
			renderer(),
			tsconfigPaths(),
			react(),
			ViteImageOptimizer({
				png: {
					quality: 70,
				},
				jpeg: {
					quality: 60,
				},
			}),
			dynamicImport({
				filter: (id) => {
					if (id.includes("/node_modules/mui-symbols")) return true;
				},
			}),
			splitVendorChunkPlugin(),
			obfuscator({
				selfDefending: false,
				seed: 94,
			}),
		],
	},
	preload: {
		build: {
			emptyOutDir: false,
			rollupOptions: {
				input: {
					module: path.resolve(__dirname, "src", "main", "lumi", "module.ts"),
					hasher: path.resolve(__dirname, "src", "main", "project-hasher.ts"),
				},
				output: {
					dir: path.resolve(__dirname),
					entryFileNames: (chunkInfo) => {
						if (chunkInfo.name === "module") return "out/main/[name].js";
						if (chunkInfo.name === "hasher") return "pipeline/[name].js";
					},
					compact: true,
				},
				external: ["lumi-control"],
			},
		},
		plugins: [
			tsconfigPaths(),
			externalizeDepsPlugin({
				exclude: ["p-queue"],
			}),
		],
	},
});

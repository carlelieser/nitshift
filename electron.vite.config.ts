import { defineConfig, externalizeDepsPlugin, loadEnv, splitVendorChunkPlugin } from "electron-vite";
import tsconfigPaths from "vite-tsconfig-paths";
import renderer from "vite-plugin-electron-renderer";
import react from "@vitejs/plugin-react";
import dynamicImport from "vite-plugin-dynamic-import";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import path from "node:path";

const deps = ["lumi-control", "regedit"];

export default defineConfig(({ mode }) => {
	loadEnv(mode);

	return {
		main: {
			plugins: [
				tsconfigPaths(),
				externalizeDepsPlugin({
					include: deps,
					exclude: ["p-queue"]
				})
			]
		},
		renderer: {
			plugins: [
				renderer(),
				tsconfigPaths(),
				react({
					babel: {
						compact: true
					}
				}),
				ViteImageOptimizer({
					png: {
						quality: 70
					},
					jpeg: {
						quality: 60
					}
				}),
				dynamicImport({
					filter: (id) => {
						if (id.includes("/node_modules/mui-symbols")) return true;
					}
				}),
				splitVendorChunkPlugin()
			]
		},
		preload: {
			build: {
				emptyOutDir: false,
				rollupOptions: {
					input: {
						module: path.resolve(__dirname, "src", "main", "lumi", "module.ts")
					},
					output: {
						dir: path.resolve(__dirname),
						entryFileNames: () => "out/main/[name].js",
						compact: true
					},
					external: ["lumi-control"]
				}
			},
			plugins: [
				tsconfigPaths(),
				externalizeDepsPlugin({
					exclude: ["p-queue"]
				})
			]
		}
	};
});

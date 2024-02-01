import { reduce, throttle } from "lodash";
import { loadGlobalBrightness, loadMonitors } from "@main/storage";
import lumi from "lumi-control";
import { normalizeBrightness } from "../../common/utils";
import Shader from "../shader";
import { ipcMain } from "electron";

class BrightnessManager {
	private shades: Shader;
	public apply = throttle(
		() => {
			const monitors = loadMonitors().filter(({ disabled }) => !disabled);
			const brightness = loadGlobalBrightness();
			const nativeMonitors = monitors.filter(({ mode }) => mode === "native");
			const shadeMonitors = monitors.filter(({ mode }) => mode === "shade");

			if (nativeMonitors.length) {
				nativeMonitors.forEach((monitor) => this.shades.destroy(monitor.id));
				lumi.set(
					reduce(
						nativeMonitors,
						(prevMonitors, monitor) => ({
							...prevMonitors,
							[monitor.id]: normalizeBrightness(monitor.brightness, brightness)
						}),
						{}
					)
				);
			}
			if (shadeMonitors.length) {
				shadeMonitors.forEach((monitor) => {
					lumi.set(monitor.id, 100);
					this.shades.update(monitor.id, normalizeBrightness(monitor.brightness, brightness));
				});
			}
		},
		350,
		{ leading: true, trailing: true }
	);

	constructor(shades: Shader) {
		this.shades = shades;

		ipcMain.handle("monitor-brightness-changed", this.apply);
		ipcMain.handle("monitor-mode-changed", this.apply);
		ipcMain.handle("monitor-availability-changed", this.apply);
		ipcMain.handle("monitors-refreshed", this.apply);

		ipcMain.handle("global-brightness-changed", this.apply);
	}
}

export default BrightnessManager;

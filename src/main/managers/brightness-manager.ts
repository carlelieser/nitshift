import Shader from "../shader";
import { ipcMain } from "electron";
import createBrightnessWorker from "../workers/brightness?nodeWorker";
import { loadGlobalBrightness, loadMonitors } from "../storage";
import { UIMonitor } from "@common/types";
import { normalizeBrightness } from "@common/utils";
import { throttle } from "lodash";

class BrightnessManager {
	private shades: Shader;
	private monitors: UIMonitor[];

	constructor(shades: Shader) {
		this.shades = shades;

		ipcMain.handle("monitors/brightness/change", this.apply);
		ipcMain.handle("monitors/mode/change", this.apply);
		ipcMain.handle("monitors/availability/change", this.apply);
		ipcMain.handle("monitors/refreshed", this.apply);
		ipcMain.handle("monitors/brightness/global/changed", this.apply);
	}

	private updateMonitors = () => {
		this.monitors = loadMonitors().filter(({ disabled }) => !disabled);
	};

	private removeShadesOnNativeMonitors = () => {
		const monitors = this.monitors.filter(({ mode }) => mode === "native");
		if (monitors.length) monitors.forEach((monitor) => this.shades.destroy(monitor.id));
	};

	private applyShades = () => {
		const brightness = loadGlobalBrightness();
		const monitors = this.monitors.filter(({ mode }) => mode === "shade");

		if (monitors.length) {
			monitors.forEach((monitor) => {
				this.shades.update(monitor.id, normalizeBrightness(monitor.brightness, brightness));
				this.shades.place(monitor.id, monitor);
			});
		}
	};

	public apply = throttle(() => {
		this.updateMonitors();

		const brightness = loadGlobalBrightness();
		const monitors = this.monitors.filter(({ disabled }) => !disabled);

		const worker = createBrightnessWorker({
			workerData: { brightness, monitors }
		});

		this.removeShadesOnNativeMonitors();
		this.applyShades();

		worker.on("message", (event) => {
			if (event === "finished") worker.terminate();
		});

		worker.postMessage("apply");
	}, 350);
}

export default BrightnessManager;

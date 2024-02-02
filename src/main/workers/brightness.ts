import { parentPort, workerData } from "worker_threads";
import { reduce } from "lodash";
import { normalizeBrightness } from "@common/utils";
import lumi from "lumi-control";
import { UIMonitor } from "../../common/types";

const { brightness, monitors } = workerData;

const getNativeMonitors = () => monitors.filter(({ mode }) => mode === "native");
const getShadeMonitors = () => monitors.filter(({ mode }) => mode === "shade");

const transform = <T>(
	monitors: Array<UIMonitor>,
	transformation: (monitor: UIMonitor) => T
): {
	[monitorId: string]: T;
} =>
	reduce(
		monitors,
		(prevMonitors, monitor) => ({
			...prevMonitors,
			[monitor.id]: transformation(monitor)
		}),
		{}
	);

const apply = async (monitors: Array<UIMonitor>, transformation: (monitor: UIMonitor) => number) => {
	if (monitors.length) {
		const config = transform(monitors, transformation);
		await lumi.set(config);
	}
};

const applyNativeBrightness = () =>
	apply(getNativeMonitors(), (monitor) => normalizeBrightness(monitor.brightness, brightness));

const resetBrightnessForShadeMonitors = () => apply(getShadeMonitors(), () => 100);

const run = () => Promise.all([applyNativeBrightness(), resetBrightnessForShadeMonitors()]);

parentPort.on("message", (event) => {
	if (event === "apply") {
		run().then(() => parentPort.postMessage("finished"));
	}
});

import { BrowserWindow } from "electron";
import lumi from "lumi-control";
import EventEmitter from "events";
import { UIMonitor } from "@common/types";
import { loadMaxShadeLevel, loadMinShadeLevel } from "./storage";
import { clamp } from "lodash";

export interface Shades {
	[monitorId: string]: BrowserWindow;
}

class Shader extends EventEmitter {
	private shades: Shades = {};
	private maxBrightness = loadMaxShadeLevel();
	private minBrightness = loadMinShadeLevel();

	public create = (id: string, brightness: number) => {
		const monitors = lumi.monitors();
		const monitor = monitors.find((monitor) => monitor.id === id);
		if (!monitor) return;
		this.shades[id] = new BrowserWindow({
			transparent: true,
			alwaysOnTop: true,
			width: monitor.size.width,
			height: monitor.size.height,
			x: monitor.position.x,
			y: monitor.position.y,
			backgroundColor: this.generateColorForBrightness(brightness),
			thickFrame: false,
			hasShadow: false,
			backgroundMaterial: "none",
			skipTaskbar: true,
			fullscreen: true,
			frame: false,
			resizable: false,
			minimizable: false,
			closable: false,
			focusable: true,
			show: false,
			titleBarStyle: "hidden"
		});
		this.shades[id].setContentProtection(true);
		this.shades[id].on("blur", () => {
			this.emit("blurred", this.shades[id]);
			this.shades[id].setAlwaysOnTop(true, "screen-saver", 9999);
		});
		this.shades[id].show();
		this.shades[id].setIgnoreMouseEvents(true);
		this.shades[id].setSkipTaskbar(true);
	};

	public anyFocused = () => !!Object.values(this.shades).find((window) => window.isFocused());

	public update = (id: string, brightness: number) => {
		if (this.shades[id]) this.shades[id].setBackgroundColor(this.generateColorForBrightness(brightness));
		else this.create(id, brightness);
	};

	public place = (id: string, monitor: UIMonitor) => {
		if (this.shades[id]) {
			this.shades[id].setPosition(monitor.position.x, monitor.position.y);
			this.shades[id].setSize(monitor.size.width, monitor.size.height);
		}
	};

	public destroy = (id: string) => {
		if (this.shades[id]) {
			this.shades[id].destroy();
			delete this.shades[id];
		}
	};

	public destroyAll = () => {
		Object.keys(this.shades).forEach(this.destroy);
	};

	private generateColorForBrightness = (brightness: number) => {
		this.maxBrightness = loadMaxShadeLevel();
		this.minBrightness = loadMinShadeLevel();
		const clamped = clamp(brightness, this.minBrightness, this.maxBrightness);
		const interpolated = 100 - clamped;
		const opacity = interpolated / 100;
		return `rgba(0, 0, 0, ${opacity})`;
	};
}

export default Shader;

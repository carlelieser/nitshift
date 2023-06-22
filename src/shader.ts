import { BrowserWindow } from "electron";
import lumi from "lumi-control";
import { max, min } from "lodash";

export interface Shades {
	[monitorId: string]: BrowserWindow;
}

class Shader {
	private shades: Shades = {};
	private maxBrightness = 100;
	private minBrightness = 10;

	private generateColorForBrightness = (brightness: number) =>
		`rgba(0, 0, 0, ${min([1, max([0, (this.maxBrightness - brightness - this.minBrightness) / 100])])})`;

	public create = (id: string, brightness: number) => {
		const monitors = lumi.monitors();
		const monitor = monitors.find((monitor) => monitor.id === id);
		this.shades[id] = new BrowserWindow({
			type: "toolbar",
			transparent: true,
			alwaysOnTop: true,
			width: monitor.size.width,
			height: monitor.size.height,
			x: monitor.position.x,
			y: monitor.position.y,
			backgroundColor: this.generateColorForBrightness(brightness),
			skipTaskbar: true,
			fullscreen: true,
			frame: false,
			resizable: false,
			minimizable: false,
			closable: false,
			focusable: false,
			show: true,
		});
		this.shades[id].on("blur", () => {
			this.shades[id].setAlwaysOnTop(true, "screen-saver", 9999);
		});
		this.shades[id].setIgnoreMouseEvents(true);
	};

	public update = (id: string, brightness: number) => {
		if (this.shades[id]) this.shades[id].setBackgroundColor(this.generateColorForBrightness(brightness));
		else this.create(id, brightness);
	};

	public destroy = (id: string) => {
		if (this.shades[id]) {
			this.shades[id].destroy();
			delete this.shades[id];
		}
	};
}

export default Shader;

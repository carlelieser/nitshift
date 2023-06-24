import { BrowserWindow, screen } from "electron";
import { loadLicense, loadMode, loadMonitors, saveMonitors } from "../common/storage";
import lumi from "lumi-control";
import { isDev } from "../common/utils";
import { UIMonitor } from "../common/types";

class Window {
	private readonly entry: any;
	private dimensions: any = {
		expanded: {
			width: 400,
			height: 450,
		},
		compact: {
			width: 520,
			height: 220,
		},
		padding: 20,
	};

	public data: BrowserWindow;

	constructor(entry: any) {
		this.entry = entry;
	}

	private getCoordinates = () => {
		const { screen } = require("electron");
		const monitor = screen.getPrimaryDisplay();
		const mode = loadMode();
		const right = monitor.workArea.x + monitor.workArea.width;
		const bottom = monitor.workArea.y + monitor.workArea.height;
		const width = this.dimensions[mode].width;
		const height = this.dimensions[mode].height;

		return {
			x: right - width - this.dimensions.padding,
			y: bottom - height - this.dimensions.padding,
		};
	};

	public readjust = () => {
		if (this.data) {
			const { x, y } = this.getCoordinates();
			this.data.setPosition(x, y);
		}
	};

	public applyMode = () => {
		const mode = loadMode();
		if (this.data) {
			this.data.setResizable(true);
			this.data.setSize(this.dimensions[mode].width, this.dimensions[mode].height, true);
			this.data.setResizable(false);
			this.readjust();
		}
	};

	public create = async () => {
		const coordinates = this.getCoordinates();
		if (this.data) this.data.destroy();
		this.data = new BrowserWindow({
			transparent: true,
			show: false,
			resizable: false,
			maximizable: false,
			minimizable: false,
			skipTaskbar: true,
			fullscreenable: false,
			alwaysOnTop: true,
			frame: false,
			backgroundColor: "rgba(0, 0, 0, 0)",
			movable: false,
			webPreferences: {
				contextIsolation: false,
				nodeIntegration: true,
				nodeIntegrationInWorker: true,
				webSecurity: false,
			},
			...coordinates,
		});
		this.data.on("ready-to-show", () => this.data.show());
		this.applyMode();
		await this.data.loadURL(this.entry);
		if (isDev) {
			this.data.webContents.openDevTools({
				mode: "detach",
			});
		}
	};

	public enablePassThrough = () => {
		if (this.data) this.data.setIgnoreMouseEvents(true, { forward: true });
	};

	public disablePassThrough = () => {
		if (this.data) this.data.setIgnoreMouseEvents(false);
	};

	public refreshMonitors = () => {
		const license = loadLicense();
		const storedMonitors = loadMonitors();
		const availableMonitors = lumi.monitors();
		const monitors: Array<UIMonitor> = availableMonitors.map((monitor, index) => ({
			...monitor,
			brightness: 100,
			mode: "native",
			disabled: false,
			...(storedMonitors.find((storedMonitor) => storedMonitor.id === monitor.id) ?? {}),
			...(license === "free"
				? {
						mode: "native",
						disabled: index > 1,
						brightness: 100,
				  }
				: {}),
		}));

		monitors.sort((a, b) => {
			const aIndex = storedMonitors.findIndex((monitor) => monitor.id === a.id);
			const bIndex = storedMonitors.findIndex((monitor) => monitor.id === b.id);

			if (aIndex !== -1 && bIndex === -1) return -1;

			if (bIndex !== -1 && aIndex === -1) return 1;

			return aIndex - bIndex;
		});

		saveMonitors(monitors);

		if (this.data) this.data.webContents.send("refresh-monitors");
	};
}

export default Window;

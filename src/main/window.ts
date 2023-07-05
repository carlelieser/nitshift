import { BrowserWindow, screen } from "electron";
import { loadLicense, loadMode, loadMonitorNicknames, loadMonitors, saveMonitors } from "../common/storage";
import lumi from "lumi-control";
import { isDev } from "../common/utils";
import { UIMonitor } from "../common/types";
import EventEmitter from "events";

export const dimensions: any = {
	expanded: {
		width: 400,
		height: 450,
	},
	compact: {
		width: 520,
		height: 220,
	},
	padding: 4,
};

class Window extends EventEmitter {
	private readonly entry: any;

	public data: BrowserWindow;

	constructor(entry: any) {
		super();
		this.entry = entry;
	}

	private getWidth = () => {
		const mode = loadMode();
		return dimensions[mode].width * (process.env.CAPTURE ? 2 : 1);
	};

	private getHeight = () => {
		const mode = loadMode();
		return dimensions[mode].height * (process.env.CAPTURE ? 2 : 1);
	};

	private getCoordinates = () => {
		const { screen } = require("electron");
		const monitor = screen.getPrimaryDisplay();
		const right = monitor.workArea.x + monitor.workArea.width;
		const bottom = monitor.workArea.y + monitor.workArea.height;
		const width = this.getWidth();
		const height = this.getHeight();

		return {
			x: right - width - dimensions.padding,
			y: bottom - height - dimensions.padding,
		};
	};

	public readjust = () => {
		if (this.data) {
			const { x, y } = this.getCoordinates();
			this.data.setPosition(x, y);
		}
	};

	public applyMode = () => {
		if (this.data) {
			const width = this.getWidth();
			const height = this.getHeight();
			this.data.setResizable(true);
			this.data.setMaximumSize(width, height);
			this.data.setSize(width, height, true);
			this.data.setResizable(false);
			this.readjust();
		}
	};

	public create = async () => {
		const coordinates = this.getCoordinates();
		if (this.data) this.data.destroy();
		const mode = loadMode();
		this.data = new BrowserWindow({
			focusable: true,
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
		this.emit("window-created", this.data);
		this.data.on("ready-to-show", () => this.emit("ready-to-show", this.data));
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
		const storedMonitorNicknames = loadMonitorNicknames();
		const availableMonitors = lumi.monitors();

		const monitors: Array<UIMonitor> = availableMonitors.map((monitor, index) => {
			const nickname = storedMonitorNicknames.find(([monitorId]) => monitorId === monitor.id)?.[1];
			const storedMonitor = storedMonitors.find((storedMonitor) => storedMonitor.id === monitor.id);
			return {
				...monitor,
				brightness: 100,
				mode: "native",
				disabled: false,
				...(storedMonitor ?? {}),
				...(license === "free"
					? {
							mode: "native",
							disabled: index > 1,
							brightness: index > 1 ? 100 : storedMonitor?.brightness ?? 100,
					  }
					: {}),
				nickname: nickname ?? monitor.name,
			};
		});

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

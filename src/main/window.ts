import { BrowserWindow, screen } from "electron";
import { loadLicense, loadMode, loadMonitorNicknames, loadMonitors, saveMonitors } from "@main/storage";
import lumi from "lumi-control";
import { dimensions, isDev } from "@common/utils";
import { UIMonitor } from "@common/types";
import { clamp, uniqBy } from "lodash";
import fs from "fs-extra";
import path from "path";
import release from "@common/release.json";
import EventEmitter from "events";
import * as module from "./lumi/wrapper";
import { loadAppearance, loadStartupSettings, saveMode } from "./storage";

class Window extends EventEmitter {
	public data: BrowserWindow;
	public mode = loadMode();
	public autoHide = true;
	private readonly entry: any;

	constructor(entry: any) {
		super();
		this.entry = entry;

		this.on("ready-to-show", (window: BrowserWindow) => {
			if (loadStartupSettings().silent) {
				window.hide();
				window.blur();
				return;
			}
			window.show();
			window.focus();
			window.focusOnWebView();
		});
	}

	public readjust = () => {
		if (this.data) {
			const { x, y } = this.getCoordinates();
			this.data.setPosition(x, y);
		}
	};

	public applyMode = () => {
		if (this.data) {
			this.mode = loadMode();

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
		this.data = new BrowserWindow({
			focusable: true,
			transparent: true,
			show: false,
			resizable: false,
			maximizable: false,
			minimizable: false,
			skipTaskbar: true,
			fullscreenable: false,
			thickFrame: false,
			alwaysOnTop: true,
			frame: false,
			backgroundColor: "rgba(0,0,0,0)",
			movable: false,
			titleBarStyle: "hidden",
			webPreferences: {
				contextIsolation: false,
				nodeIntegration: true,
				nodeIntegrationInWorker: true,
				webSecurity: false,
				devTools: isDev,
			},
			...coordinates,
		});
		this.data.setAlwaysOnTop(true, "pop-up-menu");

		this.data.on("ready-to-show", () => this.emit("ready-to-show", this.data));

		this.emit("window-created", this.data);

		saveMode(loadStartupSettings().mode);

		this.applyMode();

		if (this.entry.startsWith("http")) await this.data.loadURL(this.entry);
		else await this.data.loadFile(this.entry);

		if (isDev) {
			setTimeout(() => {
				this.data.webContents.openDevTools({
					mode: "detach",
				});
			}, 1000);
		}
	};

	public enablePassThrough = () => {
		if (this.data) this.data.setIgnoreMouseEvents(true, { forward: true });
	};

	public disablePassThrough = () => {
		if (this.data) this.data.setIgnoreMouseEvents(false);
	};

	public enableAutoHide = () => (this.autoHide = true);

	public disableAutoHide = () => (this.autoHide = false);

	public refreshMonitors = async () => {
		const license = loadLicense();
		const storedMonitors = loadMonitors();
		const storedMonitorNicknames = loadMonitorNicknames();
		const availableMonitors = await module.monitors();
		const monitors: Array<UIMonitor | lumi.Monitor> = [];

		monitors.push(...storedMonitors, ...availableMonitors);

		monitors.forEach((monitor, index) => {
			const nickname = storedMonitorNicknames.find(([monitorId]) => monitorId === monitor.id)?.[1];
			const storedMonitor = storedMonitors.find((storedMonitor) => storedMonitor.id === monitor.id);
			const connected = !!availableMonitors.find(({ id }) => id === monitor.id);
			const brightness = index > 1 ? 100 : clamp(storedMonitor?.brightness ?? 100, 0, 100);

			monitors[index] = {
				...monitor,
				brightness: 100,
				mode: "native",
				disabled: false,
				...(storedMonitor ?? {}),
				...(license === "free"
					? {
							mode: "native",
							disabled: index > 1,
							brightness,
					  }
					: {}),
				nickname: nickname ?? storedMonitor?.nickname ?? monitor.name ?? "Monitor",
				connected: connected,
			};
		});

		saveMonitors(uniqBy(monitors, "id") as Array<UIMonitor>);

		if (this.data) this.data.webContents.send("refresh-monitors");
	};

	public capture = async () => {
		const [width, height] = this.data.getSize();
		const data = await this.data.webContents.capturePage({
			width,
			height,
			x: 0,
			y: 0,
		});
		const name = `${loadMode()}-${loadAppearance()}.png`;
		const output = path.resolve("screenshots", release.tag_name.split(".").join(""), name);
		return fs.outputFile(output, data.toPNG());
	};

	private getWidth = () => {
		return dimensions[this.mode].width * (process.env.CAPTURE ? 2 : 1);
	};

	private getHeight = () => {
		return dimensions[this.mode].height * (process.env.CAPTURE ? 2 : 1);
	};

	private getCoordinates = () => {
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
}

export default Window;
